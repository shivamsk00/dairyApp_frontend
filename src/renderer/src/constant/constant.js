import loginBg from '../assets/image/loginBg.jpg'
export const userInfo = {
  email: 'admin@gmail.com',
  password: 'admin'
}

const sideBarMenuList = [
  {
    id: 1,
    title: 'Dashboard',
    path: '/Dashboard',
    icon: '1'
  },
  {
    id: 2,
    title: 'Customer',
    path: '/customer',
    icon: '2'
  },
  {
    id: 3,
    title: 'Milk Add',
    path: '/milk-add',
    icon: '3'
  },
  {
    id: 4,
    title: 'Stock',
    path: '/stock',
    icon: '4'
  }
]

const colors = {
  buttonColor: '#FF6C2F',
  themeBgColor: '#F9F7F7',
  cardBgColor: '#fff'
}


export { loginBg, sideBarMenuList, colors }
