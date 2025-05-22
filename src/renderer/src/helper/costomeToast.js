// utils/CustomToast.js
import { toast } from 'react-toastify';

const CustomToast = {
  success: (message, position = "top-right") =>
    toast.success(message, {
      position,
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    }),

  error: (message, position = "top-right") =>
    toast.error(message, {
      position,
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    }),

  info: (message, position = "top-right") =>
    toast.info(message, {
      position,
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    }),

  warn: (message, position = "top-right") =>
    toast.warn(message, {
      position,
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    }),
};

export default CustomToast;
