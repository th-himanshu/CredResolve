import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import AddExpenseForm from '../components/AddExpenseForm';
import AddMemberForm from '../components/AddMemberForm';
import SettleUpForm from '../components/SettleUpForm';

const GroupDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [group, setGroup] = useState(null);
    const [balances, setBalances] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchGroupData = async () => {
        try {
            const res = await api.get(`/groups/${id}`);
            setGroup(res.data.group);
            setBalances(res.data.balances);

            const expRes = await api.get(`/expenses/${id}`);
            setExpenses(expRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchGroupData();
    }, [id]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <nav className="navbar">
                <div className="container nav-content">
                    <span className="nav-brand">CredResolve</span>
                    <div className="flex gap-20">
                        <Link to="/dashboard">Dashboard</Link>
                        <span>{user?.name}</span>
                    </div>
                </div>
            </nav>

            <div className="container">
                <div className="flex-between" style={{ marginBottom: '20px' }}>
                    <h2>{group.name}</h2>
                    <Link to="/dashboard" className="button secondary">Back</Link>
                </div>

                <div className="grid-2">
                    <div>
                        <div className="card">
                            <h3>Add Expense</h3>
                            <AddExpenseForm groupId={id} groupMembers={group.members} onExpenseAdded={fetchGroupData} />
                        </div>
                        <div className="card">
                            <h3>Settle Up</h3>
                            <SettleUpForm
                                groupId={id}
                                groupMembers={group.members}
                                balances={balances}
                                onSettled={fetchGroupData}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="card">
                            <h3>Manage Group</h3>
                            <AddMemberForm groupId={id} onMemberAdded={fetchGroupData} />
                            <h4 style={{ marginTop: '20px' }}>Members</h4>
                            <ul>
                                {group.members.map(m => (
                                    <li key={m._id} style={{ borderBottom: '1px solid #eee', padding: '5px 0' }}>
                                        {m.name} ({m.email})
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="card">
                            <h3>Simplified Balances</h3>
                            {balances.length === 0 ? <p>No debts! All settled.</p> : (
                                <ul>
                                    {balances.map((b, idx) => {
                                        const fromName = group.members.find(m => m._id === b.from)?.name || 'Unknown';
                                        const toName = group.members.find(m => m._id === b.to)?.name || 'Unknown';
                                        return (
                                            <li key={idx} className="balance-item">
                                                <strong>{fromName}</strong> owes <strong>{toName}</strong>: ${b.amount}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginTop: '20px' }}>
                    <h3>Recent Expenses</h3>
                    {expenses.length === 0 ? <p>No expenses yet.</p> : (
                        <ul>
                            {expenses.map(exp => (
                                <li key={exp._id} className="list-item">
                                    <div>
                                        <strong>{exp.description}</strong> <span className="expense-meta">({exp.splitType})</span>
                                        <div className="expense-meta">Paid by {exp.payer.name}</div>
                                    </div>
                                    <strong>${exp.amount}</strong>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupDetails;
