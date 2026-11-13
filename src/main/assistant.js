/**
 * The local chat model behind the Ask Assistant page. Runs offline in the main process with llama.cpp
 * (node-llama-cpp), on the CPU only.
 *
 * Kept light for 2 GB PCs:
 *  - the model file (Qwen3 0.6B, 378 MB) is downloaded once, on request, into the user data folder;
 *  - it is loaded only when a question needs it and unloaded after a few idle minutes, so it uses no
 *    memory the rest of the time (about 550 MB while loaded);
 *  - small context and batch, 8-bit memory cache; one question at a time.
 */
import { existsSync, statSync } from 'fs'
import { join } from 'path'

const MODEL = {
  file: 'Qwen3-0.6B-Q4_K_M.gguf',
  url: 'https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q4_K_M.gguf',
  bytes: 396705472
}
const IDLE_UNLOAD_MS = 3 * 60 * 1000
// llama.cpp ships prebuilt for 64-bit Windows only
const SUPPORTED = process.platform !== 'win32' || process.arch === 'x64' || process.arch === 'arm64'

export function createAssistantService({ app, log = console, send }) {
  const dir = join(app.getPath('userData'), 'models')
  const modelPath = join(dir, MODEL.file)

  let download = null // { downloader, progress } while downloading
  let engine = null // { llama, model, context }
  let loading = null
  let idleTimer = null
  let queue = Promise.resolve()
  let lastError = null

  const downloaded = () => existsSync(modelPath) && statSync(modelPath).size === MODEL.bytes

  const status = () => ({
    supported: SUPPORTED,
    downloaded: downloaded(),
    downloading: !!download,
    progress: download?.progress ?? 0,
    loaded: !!engine,
    sizeMB: Math.round(MODEL.bytes / 2 ** 20),
    error: lastError
  })
  const publish = () => send('assistant:status', status())

  const lib = () => import('node-llama-cpp')

  async function startDownload() {
    if (!SUPPORTED || download || downloaded()) return status()
    lastError = null
    const { createModelDownloader } = await lib()
    const downloader = await createModelDownloader({
      modelUri: MODEL.url,
      dirPath: dir,
      fileName: MODEL.file,
      deleteTempFileOnCancel: false, // a stopped download resumes where it left off
      onProgress: ({ totalSize, downloadedSize }) => {
        if (!download) return
        const progress = totalSize ? Math.floor((downloadedSize / totalSize) * 100) : 0
        if (progress !== download.progress) {
          download.progress = progress
          publish()
        }
      }
    })
    download = { downloader, progress: 0 }
    publish()
    downloader
      .download()
      .catch((error) => {
        if (download)
          lastError = `Download failed: ${error?.message || error}. Check the internet and try again.`
        log.error('Assistant model download failed:', error)
      })
      .finally(() => {
        download = null
        publish()
      })
    return status()
  }

  async function cancelDownload() {
    const current = download
    download = null
    await current?.downloader.cancel().catch(() => {})
    publish()
    return status()
  }

  async function unload() {
    clearTimeout(idleTimer)
    const current = engine
    engine = null
    if (current) {
      await current.context.dispose().catch(() => {})
      await current.model.dispose().catch(() => {})
      publish()
    }
  }

  function load() {
    if (engine) return Promise.resolve(engine)
    if (!loading) {
      loading = (async () => {
        if (!SUPPORTED) throw new Error('The assistant model needs 64-bit Windows.')
        if (!downloaded()) throw new Error('The assistant model is not downloaded yet.')
        const { getLlama } = await lib()
        const llama = await getLlama({ gpu: false, build: 'never', logLevel: 'error' })
        const model = await llama.loadModel({ modelPath })
        const context = await model.createContext({
          contextSize: 1536,
          batchSize: 64,
          flashAttention: true,
          experimentalKvCacheKeyType: 'Q8_0',
          experimentalKvCacheValueType: 'Q8_0'
        })
        engine = { llama, model, context }
        lastError = null
        publish()
        return engine
      })().finally(() => {
        loading = null
      })
    }
    return loading
  }

  /**
   * One question to the model. With `schema` the reply is JSON that matches it (grammar-forced, so even a
   * small model answers in the right shape); otherwise free text, streamed with `assistant:token`.
   *
   * @param {{ system: string, prompt: string, schema?: object, maxTokens?: number }} request
   */
  function ask({ system, prompt, schema, maxTokens = 220 }) {
    const run = async () => {
      clearTimeout(idleTimer)
      try {
        const { llama, context } = await load()
        const { LlamaChatSession, QwenChatWrapper } = await lib()
        const sequence = context.getSequence()
        const session = new LlamaChatSession({
          contextSequence: sequence,
          systemPrompt: system,
          chatWrapper: new QwenChatWrapper({ thoughts: 'discourage' })
        })
        try {
          const grammar = schema ? await llama.createGrammarForJsonSchema(schema) : undefined
          const text = await session.prompt(prompt, {
            grammar,
            maxTokens,
            temperature: schema ? 0 : 0.3,
            budgets: { thoughtTokens: 0 },
            onTextChunk: schema ? undefined : (chunk) => send('assistant:token', chunk)
          })
          return { success: true, text, json: grammar ? grammar.parse(text) : undefined }
        } finally {
          session.dispose({ disposeSequence: false })
          sequence.dispose()
        }
      } catch (error) {
        log.error('Assistant model error:', error)
        lastError = error?.message || String(error)
        publish()
        return { success: false, message: lastError }
      } finally {
        clearTimeout(idleTimer)
        idleTimer = setTimeout(unload, IDLE_UNLOAD_MS)
      }
    }
    const result = queue.then(run, run)
    queue = result.catch(() => {})
    return result
  }

  return { status, startDownload, cancelDownload, ask, unload }
}
