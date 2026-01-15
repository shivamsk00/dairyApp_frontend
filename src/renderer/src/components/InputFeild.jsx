import React from 'react'

const InputFeild = ({
    placeholder,
    onChange,
    disable,
    type = 'text',
    className = '',
    value,
    name,
    onBlur,
}) => {
    const defaultClasses = "border border-gray-300 p-2 rounded outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <input
            type={type}
            placeholder={placeholder}
            onChange={onChange}
            disabled={disable}
            className={`${defaultClasses} ${className}`}
            value={value}
            name={name}
            onBlur={onBlur}
        />
    )
}

export default InputFeild
