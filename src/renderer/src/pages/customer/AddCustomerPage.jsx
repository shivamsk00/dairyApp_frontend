import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./customer.css";
import { ArrowLeft, Landmark, Milk, ShieldCheck, MapPin, User, UserPlus, TriangleAlert } from 'lucide-react';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';
import {
    Breadcrumb,
    Button,
    FileInput,
    FormActions,
    FormSection,
    Input,
    SelectDropdown,
    SuccessModal,
    Textarea,
    useDocumentTitle
} from '../../components/ui';

const CUSTOMER_TYPES = [
    { value: 'Buyer', label: 'Buyer', description: 'Buys milk or products from the dairy' },
    { value: 'Seller', label: 'Seller', description: 'Supplies milk to the dairy' },
];

const STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
    'Lakshadweep', 'Puducherry',
].map((name) => ({ value: name, label: name }));

const digits = (value) => /^\d+$/.test(String(value));
const isBlank = (value) => value === '' || value == null || String(value).trim() === '';

// Returns an error message for one field, or '' when it is fine. Required fields mirror the
// backend rules (type, name, email, city, pincode, contact person, designation) plus the form's
// own required fields (phone, address); the rest are only checked when filled in.
const validateField = (name, value) => {
    const need = (message) => (isBlank(value) ? message : '');
    switch (name) {
        case 'customer_type':
            return need('Select a customer type');
        case 'name':
            return need('Enter the customer name') || (String(value).trim().length < 2 ? 'Name must be at least 2 characters' : '');
        case 'mobile':
            return need('Enter a phone number') || (/^\d{10}$/.test(String(value).trim()) ? '' : 'Enter a valid 10-digit phone number');
        case 'email':
            return need('Enter an email address') || (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim()) ? '' : 'Enter a valid email address');
        case 'contact_person':
            return need('Enter a contact person');
        case 'designation':
            return need('Enter a designation');
        case 'address':
            return need('Enter the address');
        case 'city':
            return need('Enter the city');
        case 'pincode':
            return need('Enter the pincode') || (/^\d{6}$/.test(String(value).trim()) ? '' : 'Pincode must be 6 digits');
        case 'bank_account':
            return isBlank(value) || /^\d{9,18}$/.test(String(value).trim()) ? '' : 'Account number must be 9–18 digits';
        case 'ifsc_code':
            return isBlank(value) || /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(String(value).trim()) ? '' : 'Enter a valid IFSC code (e.g. SBIN0001234)';
        case 'aadhar_number':
            return isBlank(value) || /^\d{12}$/.test(String(value).trim()) ? '' : 'Aadhar number must be 12 digits';
        case 'jan_aadhar_number':
            return isBlank(value) || digits(String(value).trim()) ? '' : 'Enter digits only';
        case 'total_cows':
        case 'total_buffalos':
        case 'total_animals':
            return isBlank(value) || (digits(String(value).trim()) && Number(value) <= 100000) ? '' : 'Enter a whole number (0 or more)';
        case 'bank_image':
            if (!value || !value.size) return '';
            if (!String(value.type).startsWith('image/')) return 'Choose an image file';
            return value.size > 5 * 1024 * 1024 ? 'Image must be under 5 MB' : '';
        default:
            return '';
    }
};

const FIELD_ORDER = ['customer_type', 'name', 'mobile', 'email', 'careof', 'contact_person', 'designation', 'address', 'city', 'state', 'pincode', 'bank_account', 'ifsc_code', 'subsidy_code', 'aadhar_number', 'jan_aadhar_number', 'bank_image', 'total_cows', 'total_buffalos', 'total_animals'];

const validateAll = (values) =>
    FIELD_ORDER.reduce((found, name) => {
        const message = validateField(name, values[name]);
        return message ? { ...found, [name]: message } : found;
    }, {});

// Moves keyboard focus to a field (the combobox for dropdowns) and scrolls it into view.
const focusField = (name) => {
    const el = document.querySelector(`[name="${name}"]`);
    const target = el?.getAttribute('aria-hidden') ? el.parentElement.querySelector('[role="combobox"]') : el;
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
};

const AddCustomerPage = () => {
    useDocumentTitle('Add Customer');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();

    const addCustomer = useHomeStore(state => state.addCustomer);

    const [form, setForm] = useState({
        customer_type: '',
        name: '',
        mobile: '',
        careof: '',
        email: '',
        address: '',
        city: '',
        pincode: '',
        contact_person: '',
        designation: '',
        // pan_number: '',
        state: '',
        bank_account: '',
        ifsc_code: '',
        subsidy_code: "",
        total_cows: "",
        total_buffalos: "",
        total_animals: "",
        aadhar_number: "",
        jan_aadhar_number: "",
        bank_image: ""
    });

    const handleChange = (e) => {
        const { name, type, value, files } = e.target;

        if (type === 'file') {
            setForm(prev => ({ ...prev, [name]: files[0] })); // store the file object
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
        // setForm({ ...form, [e.target.name]: e.target.value });

        // Once a field has been visited (or a submit was attempted) keep its message up to date.
        // Dropdowns have no blur step, so a choice counts as visiting them.
        const isDropdown = name === 'customer_type' || name === 'state';
        if (touched[name] || isDropdown) {
            const next = type === 'file' ? files[0] : value;
            setTouched(prev => ({ ...prev, [name]: true }));
            setErrors(prev => ({ ...prev, [name]: validateField(name, next) }));
        }
    };

    const handleBlur = (e) => {
        const { name, type, value, files } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, type === 'file' ? files[0] : value) }));
    };

   

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const found = validateAll(form);
        setErrors(found);
        setTouched(Object.fromEntries(FIELD_ORDER.map(name => [name, true])));
        const invalid = FIELD_ORDER.filter(name => found[name]);
        if (invalid.length) {
            setError(`Please fix the ${invalid.length} highlighted ${invalid.length === 1 ? 'field' : 'fields'} and try again.`);
            focusField(invalid[0]);
            return;
        }

        setSubmitting(true);

        // Create FormData
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            formData.append(key, value);
        });

        // Debug: Log FormData entries
        console.log("Form Data:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        // return
        try {
            const res = await addCustomer(formData); // <-- Your API call here
            console.log("API Response:", res);

            if (res.status_code == 200) {
                setShowSuccessModal(true);
                CustomToast.success(res.message);
                navigate('/customer');

                // Reset form
                setForm({
                    customer_type: '',
                    name: '',
                    mobile: '',
                    careof: '',
                    email: '',
                    address: '',
                    city: '',
                    pincode: '',
                    contact_person: '',
                    designation: '',
                    state: '',
                    bank_account: '',
                    ifsc_code: '',
                    subsidy_code: "",
                    total_cows: "",
                    total_buffalos: "",
                    total_animals: "",
                    aadhar_number: "",
                    jan_aadhar_number: "",
                    bank_image: ""
                });
            } else {
                const serverMessage = res.message || (typeof res.errors === 'string' ? res.errors : '');
                if (/email/i.test(serverMessage)) {
                    setErrors(prev => ({ ...prev, email: serverMessage }));
                    focusField('email');
                } else if (serverMessage) {
                    setError(serverMessage);
                }
                CustomToast.error(serverMessage || 'Something went wrong.');
            }
        } catch (error) {
            console.error('Error adding customer:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="w-full ui-text-primary">
            <Breadcrumb
                title="Add Customer"
                items={[
                    { label: 'Home', to: '/' },
                    { label: 'Customers', to: '/customer' },
                    { label: 'Add Customer' },
                ]}
                actions={
                    <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)}>
                        Back
                    </Button>
                }
            />

            <form
                onSubmit={handleSubmit}
                noValidate
                encType="multipart/form-data"
                className="mx-auto max-w-6xl space-y-5 p-3 sm:p-4 lg:p-6"
            >
                {error && (
                    <div
                        role="alert"
                        className="ui-tint-danger flex items-center gap-2 rounded-lg px-4 py-3 text-[13px] font-medium"
                    >
                        <TriangleAlert size={16} aria-hidden="true" />
                        {error}
                    </div>
                )}

                <FormSection title="Basic Details" subtitle="Who is this customer?" icon={User} tone="info">
                    <SelectDropdown
                        label="Customer Type"
                        required
                        name="customer_type"
                        error={errors.customer_type}
                        options={CUSTOMER_TYPES}
                        value={form.customer_type}
                        placeholder="Choose"
                        onChange={(value) => handleChange({ target: { name: 'customer_type', type: 'select-one', value } })}
                    />
                    <Input
                        label="Customer Name"
                        required
                        type="text"
                        name="name"
                        error={errors.name}
                        onBlur={handleBlur}
                        value={form.name}
                        onChange={handleChange}
                    />
                    <Input
                        label="Phone"
                        required
                        maxLength={10}
                        type="text"
                        name="mobile"
                        error={errors.mobile}
                        onBlur={handleBlur}
                        value={form.mobile}
                        onChange={handleChange}
                    />
                    <Input
                        label="Email"
                        required
                        type="email"
                        name="email"
                        error={errors.email}
                        onBlur={handleBlur}
                        value={form.email}
                        onChange={handleChange}
                    />
                    <Input
                        label="Care of"
                        type="text"
                        name="careof"
                        error={errors.careof}
                        onBlur={handleBlur}
                        value={form.careof}
                        onChange={handleChange}
                    />
                    <Input
                        label="Contact Person"
                        required
                        maxLength={10}
                        type="text"
                        name="contact_person"
                        error={errors.contact_person}
                        onBlur={handleBlur}
                        value={form.contact_person}
                        onChange={handleChange}
                    />
                    <Input
                        label="Designation"
                        required
                        type="text"
                        name="designation"
                        error={errors.designation}
                        onBlur={handleBlur}
                        value={form.designation}
                        onChange={handleChange}
                    />
                </FormSection>

                <FormSection title="Address" subtitle="Where the customer is located" icon={MapPin} tone="accent">
                    <Textarea
                        label="Address"
                        required
                        rows={2}
                        name="address"
                        error={errors.address}
                        onBlur={handleBlur}
                        value={form.address}
                        onChange={handleChange}
                        fieldClassName="col-span-full"
                    />
                    <Input
                        label="City"
                        required
                        type="text"
                        name="city"
                        error={errors.city}
                        onBlur={handleBlur}
                        value={form.city}
                        onChange={handleChange}
                    />
                    <SelectDropdown
                        label="State"
                        name="state"
                        error={errors.state}
                        options={STATES}
                        value={form.state}
                        searchable
                        clearable
                        placeholder="Select state"
                        searchPlaceholder="Search states…"
                        onChange={(value) => handleChange({ target: { name: 'state', type: 'select-one', value } })}
                    />
                    <Input
                        label="Pincode"
                        required
                        type="text"
                        name="pincode"
                        error={errors.pincode}
                        onBlur={handleBlur}
                        value={form.pincode}
                        onChange={handleChange}
                    />
                </FormSection>

                <FormSection title="Bank & Subsidy" subtitle="Payment and subsidy details" icon={Landmark} tone="success">
                    <Input
                        label="Bank Account"
                        type="text"
                        name="bank_account"
                        error={errors.bank_account}
                        onBlur={handleBlur}
                        value={form.bank_account}
                        onChange={handleChange}
                    />
                    <Input
                        label="IFSC Code"
                        type="text"
                        name="ifsc_code"
                        error={errors.ifsc_code}
                        onBlur={handleBlur}
                        value={form.ifsc_code}
                        onChange={handleChange}
                    />
                    <Input
                        label="Subsidy Code"
                        type="text"
                        name="subsidy_code"
                        error={errors.subsidy_code}
                        onBlur={handleBlur}
                        value={form.subsidy_code}
                        onChange={handleChange}
                    />
                </FormSection>

                <FormSection title="Verification" subtitle="Identity documents" icon={ShieldCheck} tone="primary">
                    <Input
                        label="Aadhar No."
                        type="number"
                        name="aadhar_number"
                        error={errors.aadhar_number}
                        onBlur={handleBlur}
                        value={form.aadhar_number}
                        onChange={handleChange}
                    />
                    <Input
                        label="Jan Aadhar"
                        type="number"
                        name="jan_aadhar_number"
                        error={errors.jan_aadhar_number}
                        onBlur={handleBlur}
                        value={form.jan_aadhar_number}
                        onChange={handleChange}
                    />
                    <FileInput
                        label="Bank Copy Image"
                        accept="image/*"
                        name="bank_image"
                        error={errors.bank_image}
                        onBlur={handleBlur}
                        placeholder="Choose an image…"
                        fileName={form.bank_image?.name}
                        onChange={handleChange}
                    />
                </FormSection>

                <FormSection title="Animals" subtitle="Livestock the customer keeps" icon={Milk} tone="warning">
                    <Input
                        label="Total Cows"
                        type="number"
                        name="total_cows"
                        error={errors.total_cows}
                        onBlur={handleBlur}
                        value={form.total_cows}
                        onChange={handleChange}
                    />
                    <Input
                        label="Total Buffalos"
                        type="number"
                        name="total_buffalos"
                        error={errors.total_buffalos}
                        onBlur={handleBlur}
                        value={form.total_buffalos}
                        onChange={handleChange}
                    />
                    <Input
                        label="Total Animals"
                        type="number"
                        name="total_animals"
                        error={errors.total_animals}
                        onBlur={handleBlur}
                        value={form.total_animals}
                        onChange={handleChange}
                    />
                </FormSection>

                <FormActions>
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button type="submit" icon={UserPlus} loading={submitting}>
                        Add Customer
                    </Button>
                </FormActions>
            </form>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => navigate('/customer')}
                title="Customer Added Successfully"
                buttonLabel="Go to Customer List"
            />
        </div>
    );
};

export default AddCustomerPage;
