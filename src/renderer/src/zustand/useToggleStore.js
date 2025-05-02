import { create } from 'zustand'

const useToggleStore = create((set) => ({
  isMenu: false,
  menuToggle: (toggleMenu) => {
    set({isMenu:toggleMenu})

  }
}))

export default useToggleStore