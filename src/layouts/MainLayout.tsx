import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Move your nav code here
import Footer from '../components/Footer'; // Move your footer code here


const MainLayout: React.FC = () => {
    return (
        // <div className="bg-slate-50 font-body text-on-surface min-h-screen">
        <div className="bg-background  font-['Inter'] overflow-x-hidden selection:bg-background/30">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div >
    );
};

export default MainLayout;