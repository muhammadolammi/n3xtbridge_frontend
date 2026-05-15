
import { useAuth } from '../context/AuthContext';
import ClientDashboard from '../components/ClientDashboard';
import AdminDashboard from '../components/AdminDashboard';
import StaffDashboard from '../components/StaffDashboard';






const Dashboard = () => {
    const { user } = useAuth();

    if (user) {
        return (
            <div className="min-h-screen  p-8 pt-24 ">
                {user.role === 'admin' ? (
                    <AdminDashboard user={user} />
                ) : user.role === 'staff' ? (
                    <StaffDashboard user={user} />
                ) : (
                    <ClientDashboard user={user} />
                )}
            </div>
        )
    }
};

export default Dashboard;