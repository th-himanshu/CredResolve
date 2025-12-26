import { useState } from 'react';
import api from '../utils/api';

const AddExpenseForm = ({ groupId, groupMembers, onExpenseAdded }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [splitType, setSplitType] = useState('EQUAL');
    // For EXACT/PERCENT, we need per-user inputs.
    // Initialize splits state with all members
    const [splits, setSplits] = useState(
        groupMembers.map(m => ({ userId: m._id, amount: '', percentage: '' }))
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            groupId,
            description,
            amount: Number(amount),
            splitType,
            splits: splits.map(s => ({
                userId: s.userId,
                amount: s.amount ? Number(s.amount) : 0,
                percentage: s.percentage ? Number(s.percentage) : 0
            }))
        };

        try {
            await api.post('/expenses', payload);
            setDescription('');
            setAmount('');
            setSplitType('EQUAL');
            onExpenseAdded();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error adding expense');
        }
    };

    const handleSplitChange = (index, field, value) => {
        const newSplits = [...splits];
        newSplits[index][field] = value;
        setSplits(newSplits);
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
            <div className="form-group">
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                />
            </div>
            <div className="grid-2 form-group">
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                />
                <select value={splitType} onChange={e => setSplitType(e.target.value)}>
                    <option value="EQUAL">Equal Split</option>
                    <option value="EXACT">Exact Amount</option>
                    <option value="PERCENT">Percentage</option>
                </select>
            </div>

            {splitType !== 'EQUAL' && (
                <div className="form-group" style={{ background: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
                    <h4 style={{ marginBottom: '10px' }}>Split Details</h4>
                    <div className="split-grid">
                        {groupMembers.map((member, idx) => (
                            <div key={member._id}>
                                <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>{member.name}</label>
                                {splitType === 'EXACT' && (
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        value={splits[idx]?.amount || ''}
                                        onChange={e => handleSplitChange(idx, 'amount', e.target.value)}
                                    />
                                )}
                                {splitType === 'PERCENT' && (
                                    <input
                                        type="number"
                                        placeholder="%"
                                        value={splits[idx]?.percentage || ''}
                                        onChange={e => handleSplitChange(idx, 'percentage', e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button type="submit" style={{ width: '100%' }}>Add Expense</button>
        </form>
    );
};

export default AddExpenseForm;
