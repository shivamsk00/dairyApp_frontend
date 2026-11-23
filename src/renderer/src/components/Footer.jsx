import { AppFooter } from './ui'

const Footer = () => (
  <AppFooter
    compact
    bare
    copyright={
      <>
        © 2025 | Powered by{' '}
        <span className="font-semibold text-[color:var(--ui-text-secondary)]">
          Production House
        </span>
      </>
    }
  />
)

export default Footer
