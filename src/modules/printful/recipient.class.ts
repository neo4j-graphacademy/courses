export default class Recipient {
    constructor(
        public readonly name: string,
        public readonly address1: string,
        public readonly address2: string | undefined,
        public readonly city: string,
        public readonly state_code: string = "",
        public readonly state_name: string = "",
        public readonly country_code: string = "",
        public readonly country_name: string,
        public readonly zip: string,
        public readonly email: string = "",
        public readonly phone: string = "",
        public readonly company: string = "",
        public readonly tax_number: string = "",
    ) { }

    validate(): { valid: boolean, errors: Record<string, any> } {
        let valid = true
        const errors = {}

        if (this.address1.length === 0 || this.address1.length > 50) {
            valid = false
            errors['address1'] = `Invalid address1, required and less than 50 characters`
        }
        if (this.address2 && (this.address2?.length === 0 || this.address2?.length > 40)) {
            valid = false
            errors['address2'] = `Invalid address2, required and less than 40 characters`
        }
        if (this.city.length === 0 || this.city.length > 35) {
            valid = false
            errors['city'] = `Invalid city, required and less than 35 characters`
        }
        if (this.zip.length === 0 || this.zip.length > 10) {
            valid = false
            errors['zip'] = `Invalid zip, required and less than 10 characters`
        }
        if (this.address1.length + (this.address2?.length || 0) + this.city.length > 100) {
            valid = false
            errors['address1'] = `Invalid address, entire address should be less than 100 characters long`
        }
        if (this.country_code == 'BR' && (!this.tax_number || this.tax_number.length === 0)) {
            valid = false
            errors['tax_number'] = `Tax number is required`
        }
        if (this.country_code == 'IN' && this.state_code == '') {
            valid = false
            errors['state_text'] = `State code is required`
        }

        return {
            valid,
            errors
        }
    }

    toObject() {
        return Object.assign({}, this)
    }
}
