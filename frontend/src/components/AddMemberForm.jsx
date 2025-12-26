import { useState } from 'react';
import api from '../utils/api';

const AddMemberForm = ({ groupId, onMemberAdded }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/groups/${groupId}/members`, { email });
            setEmail('');
            onMemberAdded();
            alert('Member added successfully');
        } catch (err) {
            alert(err.response?.data?.msg || 'Error adding member');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
            <div className="form-group">
                <input
                    type="email"
                    placeholder="Member Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className="secondary" style={{ width: '100%' }}>Add Member</button>
        </form>
    );
};

export default AddMemberForm;
