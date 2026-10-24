/* eslint-disable react/prop-types -- React 19 ignores propTypes; props are documented below */
import { forwardRef, useId } from 'react'
import { Paperclip, X } from 'lucide-react'
import Field from './Field'
import cx from '../utils/cx'
import '../ui.css'

// Shared wiring for the three native controls: id, labelling and the error state.
const useControl = ({ id, label, required, requiredMark, hint, error, fieldClassName }) => {
  const auto = useId()
  const controlId = id ?? auto
  return {
    controlId,
    fieldProps: {
      id: controlId,
      label,
      required: required || requiredMark,
      hint,
      error,
      className: fieldClassName
    },
    aria: {
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error || hint ? `${controlId}-message` : undefined
    }
  }
}

/**
 * Text-like input (text, email, number, tel, password…). All native props pass through.
 *
 * @param {React.ReactNode} [label]
 * @param {boolean} [required] Native `required` plus the red asterisk.
 * @param {boolean} [requiredMark] Asterisk only, without native validation.
 * @param {React.ReactNode} [hint]
 * @param {React.ReactNode} [error]
 * @param {string} [fieldClassName] Classes for the wrapper (grid placement).
 */
export const Input = forwardRef(function Input(
  { label, requiredMark, hint, error, fieldClassName, className, id, ...rest },
  ref
) {
  const { controlId, fieldProps, aria } = useControl({
    id,
    label,
    required: rest.required,
    requiredMark,
    hint,
    error,
    fieldClassName
  })
  return (
    <Field {...fieldProps}>
      <input ref={ref} id={controlId} className={cx('ui-input', className)} {...aria} {...rest} />
    </Field>
  )
})

/** Native select. Pass <option>s as children. Same props as Input. */
export const Select = forwardRef(function Select(
  { label, requiredMark, hint, error, fieldClassName, className, id, children, ...rest },
  ref
) {
  const { controlId, fieldProps, aria } = useControl({
    id,
    label,
    required: rest.required,
    requiredMark,
    hint,
    error,
    fieldClassName
  })
  return (
    <Field {...fieldProps}>
      <select ref={ref} id={controlId} className={cx('ui-input', className)} {...aria} {...rest}>
        {children}
      </select>
    </Field>
  )
})

/** Multi-line input. Same props as Input; `rows` sets the starting height. */
export const Textarea = forwardRef(function Textarea(
  { label, requiredMark, hint, error, fieldClassName, className, id, ...rest },
  ref
) {
  const { controlId, fieldProps, aria } = useControl({
    id,
    label,
    required: rest.required,
    requiredMark,
    hint,
    error,
    fieldClassName
  })
  return (
    <Field {...fieldProps}>
      <textarea
        ref={ref}
        id={controlId}
        className={cx('ui-input', className)}
        {...aria}
        {...rest}
      />
    </Field>
  )
})

/**
 * File picker styled as a field. The parent keeps the File (as with a plain <input type="file">);
 * pass its name back in `fileName` so the field can show it.
 *
 * @param {string} [fileName] Name of the currently chosen file.
 * @param {() => void} [onClear] Shows a clear button when a file is chosen.
 * @param {string} [placeholder='Choose a file…']
 */
export const FileInput = forwardRef(function FileInput(
  {
    label,
    requiredMark,
    hint,
    error,
    fieldClassName,
    className,
    id,
    fileName,
    onClear,
    placeholder = 'Choose a file…',
    ...rest
  },
  ref
) {
  const { controlId, fieldProps, aria } = useControl({
    id,
    label,
    required: rest.required,
    requiredMark,
    hint,
    error,
    fieldClassName
  })
  return (
    <Field {...fieldProps}>
      <div className="relative">
        <label
          htmlFor={controlId}
          className={cx(
            'ui-input flex cursor-pointer items-center gap-2 pr-9',
            fileName ? 'ui-text-primary' : 'ui-text-tertiary',
            className
          )}
        >
          <Paperclip size={14} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{fileName || placeholder}</span>
        </label>
        <input ref={ref} id={controlId} type="file" className="sr-only" {...aria} {...rest} />
        {fileName && onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove file"
            className="ui-icon-btn absolute right-1 top-1/2 inline-flex !size-7 -translate-y-1/2"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>
    </Field>
  )
})
