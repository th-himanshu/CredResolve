import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await api.get('/groups');
                setGroups(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchGroups();
    }, []);

    const createGroup = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/groups', { name: newGroupName, members: [] }); // Start with just creator
            setGroups([...groups, res.data]);
            setNewGroupName('');
        } catch (err) {
            alert('Failed to create group');
        }
    };

    return (
        <div>
            <nav className="navbar">
                <div className="container nav-content">
                    <span className="nav-brand">CredResolve</span>
                    <div className="flex gap-20">
                        <span>Welcome, {user?.name}</span>
                        <button onClick={logout} className="secondary">Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container">
                <div className="grid-2">
                    <div className="card">
                        <h3>Create New Group</h3>
                        <form onSubmit={createGroup}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Group Name"
                                    value={newGroupName}
                                    onChange={e => setNewGroupName(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit">Create Group</button>
                        </form>
                    </div>

                    <div className="card">
                        <h3>Your Groups</h3>
                        {groups.length === 0 ? <p>No groups yet.</p> : (
                            <ul>
                                {groups.map(group => (
                                    <li key={group._id} className="list-item">
                                        <Link to={`/group/${group._id}`}>{group.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
