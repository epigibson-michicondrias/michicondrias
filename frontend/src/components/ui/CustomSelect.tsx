"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./CustomSelect.module.css";

interface Option {
    value: string;
    label: string;
    icon?: string;
    colorHint?: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
    className?: string;
    placement?: "top" | "bottom";
}

export default function CustomSelect({ options, value, onChange, disabled, className, placement = "bottom" }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.addEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div
            className={`${styles["custom-select-wrapper"]} ${className || ""} ${disabled ? styles["disabled"] : ""} ${placement === "top" ? styles["placement-top"] : ""}`}
            ref={selectRef}
        >
            <div
                className={`${styles["select-trigger"]} ${isOpen ? styles["open"] : ""}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className={styles["selected-value"]}>
                    {selectedOption.colorHint && (
                        <span className={styles["color-dot"]} style={{ backgroundColor: selectedOption.colorHint }} />
                    )}
                    {selectedOption.icon && <span className={styles["opt-icon"]}>{selectedOption.icon}</span>}
                    <span>{selectedOption.label}</span>
                </div>
                <span className={styles["chevron"]}>▼</span>
            </div>

            {isOpen && (
                <ul className={styles["options-list"]}>
                    {options.map((opt) => (
                        <li
                            key={opt.value}
                            className={`${styles["option"]} ${opt.value === value ? styles["selected"] : ""}`}
                            onClick={() => handleSelect(opt.value)}
                        >
                            {opt.colorHint && (
                                <span className={styles["color-dot"]} style={{ backgroundColor: opt.colorHint }} />
                            )}
                            {opt.icon && <span className={styles["opt-icon"]}>{opt.icon}</span>}
                            <span>{opt.label}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
