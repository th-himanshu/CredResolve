import { useState } from 'react';
import api from '../utils/api';

const SettleUpForm = ({ groupId, groupMembers, balances, onSettled }) => {
    const [payeeId, setPayeeId] = useState('');
    const [amount, setAmount] = useState('');

    // Filter relevant payees (people I owe?) or just anyone
    // For simplicity, let user pick anyone in group.

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/settlements', { groupId, payeeId, amount });
            setPayeeId('');
            setAmount('');
            onSettled();
            alert('Payment recorded');
        } catch (err) {
            alert(err.response?.data?.msg || 'Error recording settlement');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
            <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px' }}>Pay To:</label>
                <select value={payeeId} onChange={e => setPayeeId(e.target.value)} required>
                    <option value="">Select User</option>
                    {groupMembers.map(m => (
                        <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                />
            </div>
            <button type="submit" style={{ width: '100%', background: '#ff9900' }}>Record Payment</button>
        </form>
    );
};

export default SettleUpForm;
