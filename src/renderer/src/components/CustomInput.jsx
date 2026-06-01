// components/CustomInput.jsx
import React, { useState, forwardRef } from 'react';
import { FaEye, FaEyeSlash, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const CustomInput = forwardRef(({
    type = 'text',
    label,
    placeholder,
    value,
    onChange,
    onBlur,
    onFocus,
    error,
    success,
    disabled = false,
    required = false,
    size = 'md',
    variant = 'default',
    icon,
    clearable = false,
    maxLength,
    className = '',
    helperText,
    ...props
}, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState(value || '');

    const handleFocus = (e) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        setInternalValue(newValue);
        onChange?.(e);
    };

    const handleClear = () => {
        const syntheticEvent = {
            target: { value: '' }
        };
        setInternalValue('');
        onChange?.(syntheticEvent);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Classic Windows 95/98 exact measurements [web:264][web:271]
    const sizeClasses = {
        sm: 'h-5 px-1 text-xs',      // 20px height - exact Windows small
        md: 'h-6 px-2 text-sm',      // 24px height - exact Windows default
        lg: 'h-8 px-3 text-base'     // 32px height - exact Windows large
    };

    // Authentic Windows 95 styling [web:271][web:274]
    const getInputClasses = () => {
        let baseClasses = `
            w-full font-mono bg-white text-black
            border-2 transition-none
            focus:outline-none
            ${sizeClasses[size]}
        `;

        if (disabled) {
            return baseClasses + ` 
                bg-gray-100 text-gray-500 cursor-not-allowed
                border-t-gray-500 border-l-gray-500 
                border-r-gray-400 border-b-gray-400
            `;
        }

        // Classic Windows inset styling for input fields [web:271]
        if (isFocused) {
            return baseClasses + ` 
                border-t-black border-l-black 
                border-r-gray-300 border-b-gray-300
            `;
        }

        // Default Windows 95 input field [web:264]
        return baseClasses + ` 
            border-t-gray-500 border-l-gray-500 
            border-r-white border-b-white
        `;
    };

    // Authentic Windows 95 button styling [web:264][web:274]
    const getButtonClasses = (pressed = false) => {
        if (pressed) {
            return `
                w-4 h-4 bg-gray-200 text-black text-xs
                border border-t-gray-500 border-l-gray-500 
                border-r-white border-b-white
                flex items-center justify-center cursor-pointer
                font-mono transition-none
            `;
        }
        return `
            w-4 h-4 bg-gray-200 text-black text-xs
            border border-t-white border-l-white 
            border-r-gray-500 border-b-gray-500
            flex items-center justify-center cursor-pointer
            hover:bg-gray-300 active:bg-gray-200
            font-mono transition-none
        `;
    };

    // Windows 95 label styling [web:271]
    const getLabelClasses = () => {
        return `
            block text-sm font-normal mb-1 text-black 
            font-mono leading-none
            ${error ? 'text-red-900' : ''}
            ${success ? 'text-green-900' : ''}
        `;
    };

    return (
        <div className={`relative ${className}`}>
            {/* Classic Windows Label [web:271] */}
            {label && (
                <label className={getLabelClasses()}>
                    {label}
                    {required && <span className="text-red-900 ml-1">*</span>}
                </label>
            )}

            {/* Windows 95 Input Container */}
            <div className="relative inline-block">
                {/* Left Icon (Classic Windows style) */}
                {icon && (
                    <div className="absolute left-1 top-0 bottom-0 flex items-center pointer-events-none z-10">
                        <div className="text-black text-xs">{icon}</div>
                    </div>
                )}

                {/* Authentic Windows 95 Input Field [web:264][web:271] */}
                <input
                    ref={ref}
                    type={type === 'password' && showPassword ? 'text' : type}
                    value={value !== undefined ? value : internalValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={maxLength}
                    className={`
                        ${getInputClasses()}
                        ${icon ? 'pl-6' : ''}
                        ${(clearable || type === 'password') ? 'pr-10' : ''}
                    `}
                    style={{
                        // Exact Windows 95 font and styling
                        fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
                        fontSize: size === 'sm' ? '11px' : size === 'md' ? '11px' : '12px',
                        lineHeight: '1',
                    }}
                    {...props}
                />

                {/* Windows 95 Right Button Area [web:274] */}
                {(clearable || type === 'password' || error || success) && (
                    <div className="absolute right-0 top-0 bottom-0 flex items-center pr-1 space-x-0.5">
                        {/* Clear Button */}
                        {clearable && internalValue && !disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className={getButtonClasses()}
                                title="Clear"
                                style={{ fontFamily: 'MS Sans Serif, Tahoma, sans-serif' }}
                            >
                                ×
                            </button>
                        )}

                        {/* Password Toggle */}
                        {type === 'password' && (
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className={getButtonClasses()}
                                title={showPassword ? "Hide" : "Show"}
                                style={{ fontFamily: 'MS Sans Serif, Tahoma, sans-serif' }}
                            >
                                {showPassword ? '◦' : '•'}
                            </button>
                        )}

                        {/* Status Indicators - Windows 95 style */}
                        {error && (
                            <div className="w-4 h-4 bg-red-500 border border-red-900 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">!</span>
                            </div>
                        )}
                        {success && (
                            <div className="w-4 h-4 bg-green-600 border border-green-900 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">✓</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Character Count - Windows 95 Status Bar Style [web:271] */}
            {maxLength && (
                <div className="mt-1 bg-gray-200 border border-t-gray-500 border-l-gray-500 border-r-white border-b-white px-2 py-0.5">
                    <span 
                        className={`text-xs ${internalValue.length > maxLength * 0.8 ? 'text-red-900' : 'text-black'}`}
                        style={{ fontFamily: 'MS Sans Serif, Tahoma, sans-serif' }}
                    >
                        {internalValue.length}/{maxLength}
                    </span>
                </div>
            )}

            {/* Classic Windows Error/Helper Message [web:271] */}
            {(helperText || error) && (
                <div className="mt-1 bg-gray-200 border border-t-gray-500 border-l-gray-500 border-r-white border-b-white p-2">
                    {error && (
                        <p 
                            className="text-xs text-red-900 flex items-center"
                            style={{ fontFamily: 'MS Sans Serif, Tahoma, sans-serif' }}
                        >
                            <span className="w-3 h-3 bg-red-500 border border-red-900 flex items-center justify-center mr-2 text-xs">
                                <span className="text-white font-bold" style={{ fontSize: '8px' }}>!</span>
                            </span>
                            {error}
                        </p>
                    )}
                    {helperText && !error && (
                        <p 
                            className="text-xs text-black"
                            style={{ fontFamily: 'MS Sans Serif, Tahoma, sans-serif' }}
                        >
                            {helperText}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
});

CustomInput.displayName = 'CustomInput';

export default CustomInput;
