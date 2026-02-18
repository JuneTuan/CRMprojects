export interface ValidationRule {
    required?: boolean
    message?: string
    pattern?: RegExp
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    validator?: (value: any) => boolean | string
}

export interface ValidationRules {
    [key: string]: ValidationRule | ValidationRule[]
}

export interface ValidationResult {
    valid: boolean
    errors: { [key: string]: string }
}

export interface FormField {
    value: any
    error?: string
    touched?: boolean
}

export class FormValidator {
    private rules: ValidationRules
    private fields: { [key: string]: FormField } = {}

    constructor(rules: ValidationRules) {
        this.rules = rules
    }

    setFieldValue(fieldName: string, value: any): void {
        if (!this.fields[fieldName]) {
            this.fields[fieldName] = { value, touched: true }
        } else {
            this.fields[fieldName].value = value
            this.fields[fieldName].touched = true
        }
    }

    getFieldValue(fieldName: string): any {
        return this.fields[fieldName]?.value
    }

    getFieldError(fieldName: string): string | undefined {
        return this.fields[fieldName]?.error
    }

    getFieldTouched(fieldName: string): boolean {
        return this.fields[fieldName]?.touched || false
    }

    validateField(fieldName: string): boolean {
        const field = this.fields[fieldName]
        if (!field) return false

        const rules = this.rules[fieldName]
        if (!rules) return true

        const ruleArray = Array.isArray(rules) ? rules : [rules]
        let error: string | undefined

        for (const rule of ruleArray) {
            if (rule.required && (field.value === undefined || field.value === null || field.value === '')) {
                error = rule.message || `${fieldName}不能为空`
                break
            }

            if (field.value !== undefined && field.value !== null && field.value !== '') {
                if (rule.pattern && !rule.pattern.test(field.value)) {
                    error = rule.message || `${fieldName}格式不正确`
                    break
                }

                if (rule.min !== undefined && Number(field.value) < rule.min) {
                    error = rule.message || `${fieldName}不能小于${rule.min}`
                    break
                }

                if (rule.max !== undefined && Number(field.value) > rule.max) {
                    error = rule.message || `${fieldName}不能大于${rule.max}`
                    break
                }

                if (rule.minLength !== undefined && String(field.value).length < rule.minLength) {
                    error = rule.message || `${fieldName}长度不能少于${rule.minLength}个字符`
                    break
                }

                if (rule.maxLength !== undefined && String(field.value).length > rule.maxLength) {
                    error = rule.message || `${fieldName}长度不能超过${rule.maxLength}个字符`
                    break
                }

                if (rule.validator) {
                    const result = rule.validator(field.value)
                    if (result !== true) {
                        error = typeof result === 'string' ? result : rule.message || `${fieldName}验证失败`
                        break
                    }
                }
            }
        }

        field.error = error
        return !error
    }

    validateAll(): ValidationResult {
        const errors: { [key: string]: string } = {}
        let valid = true

        for (const fieldName in this.rules) {
            const isValid = this.validateField(fieldName)
            if (!isValid) {
                valid = false
                const error = this.fields[fieldName]?.error
                if (error) {
                    errors[fieldName] = error
                }
            }
        }

        return { valid, errors }
    }

    resetField(fieldName: string): void {
        if (this.fields[fieldName]) {
            this.fields[fieldName].value = undefined
            this.fields[fieldName].error = undefined
            this.fields[fieldName].touched = false
        }
    }

    resetAll(): void {
        for (const fieldName in this.fields) {
            this.resetField(fieldName)
        }
    }

    getValues(): { [key: string]: any } {
        const values: { [key: string]: any } = {}
        for (const fieldName in this.fields) {
            values[fieldName] = this.fields[fieldName].value
        }
        return values
    }
}

export const commonRules = {
    phone: {
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号码'
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: '请输入正确的邮箱地址'
    },
    password: {
        minLength: 6,
        message: '密码长度不能少于6位'
    },
    idCard: {
        pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
        message: '请输入正确的身份证号码'
    },
    positiveNumber: {
        pattern: /^[1-9]\d*$/,
        message: '请输入正整数'
    },
    positiveDecimal: {
        pattern: /^[1-9]\d*(\.\d+)?$/,
        message: '请输入正数'
    }
}