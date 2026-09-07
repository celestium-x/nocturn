'use client';
import AppLogo from '../app/AppLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import NavResourcesDropdown from './NavResourcesDropdown';
import SigninModal from '../utility/SigninModal';
import { cn } from '@/lib/utils';
import { FiMenu, FiX } from 'react-icons/fi';

export default function LandingNavbarComponent() {
    const { session, openSigninModal, setOpenSigninModal } = useUserSessionStore();
    const router = useRouter();
    const pathname = usePathname();
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const [bgStyle, setBgStyle] = useState({ left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [atTop, setAtTop] = useState<boolean>(true);
    const [showResources, setShowResources] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const resourcesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        function handleScroll() {
            setAtTop(window.scrollY < 50);
        }
        document.addEventListener('scroll', handleScroll);
        return () => document.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key !== 'Escape') return;
            if (openSigninModal) setOpenSigninModal(false);
            if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openSigninModal, setOpenSigninModal, isMobileMenuOpen]);

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        const item = e.currentTarget;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        setBgStyle({
            left: itemRect.left - containerRect.left,
            width: itemRect.width,
        });
    };

    function handleAuth() {
        if (!session) {
            setOpenSigninModal(true);
            return;
        }
        router.push('/home');
    }

    const isActive = (path: string) => {
        if (path === '') return pathname === '/';
        return pathname.startsWith(`/${path}`);
    };

    return (
        <>
            <motion.nav
                animate={{
                    height: atTop ? 84 : 64,
                    backdropFilter: atTop ? 'blur(0px)' : 'blur(12px)',
                    backgroundColor: atTop ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.92)',
                }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                className={cn(
                    'w-full fixed inset-x-0 top-0 flex items-center justify-between z-50 px-6 xl:px-8',
                    'border-b border-px border-dark-alpha/5',
                    'shadow-custom',
                    !atTop && 'shadow-[0_4px_24px_rgba(0,0,0,0.04)]',
                )}
                style={{
                    WebkitBackdropFilter: atTop ? 'blur(0px)' : 'blur(12px)',
                }}
            >
                {/* Logo */}
                <div className="flex items-center">
                    <AppLogo
                        size={atTop ? 110 : 90}
                        className="relative -left-1 md:-left-2 top-0.5"
                    />
                    <span className="ml-2 text-dark-base font-nocturn font-semibold text-xl tracking-tight">
                        Nocturn
                    </span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-x-1">
                    <div
                        ref={containerRef}
                        className="relative flex items-center gap-x-1 bg-dark-alpha/3 rounded-full p-1.5"
                        onMouseLeave={() => setHoveredIdx(null)}
                    >
                        <AnimatePresence>
                            {hoveredIdx !== null && (
                                <motion.div
                                    key="nav-hover-bg"
                                    className="absolute top-1.5 h-9 bg-white rounded-full pointer-events-none shadow-sm"
                                    initial={{
                                        left: bgStyle.left,
                                        width: bgStyle.width,
                                        opacity: 0,
                                        scale: 0.95,
                                    }}
                                    animate={{
                                        left: bgStyle.left,
                                        width: bgStyle.width,
                                        opacity: 1,
                                        scale: 1,
                                    }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                />
                            )}
                        </AnimatePresence>

                        {navItems.map((item, idx) => {
                            const active = isActive(item.redirectUrl);
                            return (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        if (item.redirectUrl) {
                                            router.push(`/${item.redirectUrl}`);
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        setHoveredIdx(idx);
                                        handleMouseEnter(e);
                                        if (item.name === 'Resources') {
                                            if (resourcesTimeoutRef.current)
                                                clearTimeout(resourcesTimeoutRef.current);
                                            setShowResources(true);
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        if (item.name === 'Resources') {
                                            resourcesTimeoutRef.current = setTimeout(
                                                () => setShowResources(false),
                                                150,
                                            );
                                        }
                                    }}
                                    className={cn(
                                        'relative text-[14.5px] font-medium tracking-[-0.01em] h-9 w-fit flex items-center justify-center px-4 rounded-full cursor-pointer z-10 transition-colors duration-200',
                                        active
                                            ? 'text-nprimary font-semibold'
                                            : 'text-dark-base/80 hover:text-dark-base',
                                    )}
                                >
                                    {item.name}
                                    {item.name === 'Resources' && (
                                        <AnimatePresence>
                                            {showResources && (
                                                <NavResourcesDropdown
                                                    onMouseEnter={() => {
                                                        if (resourcesTimeoutRef.current)
                                                            clearTimeout(
                                                                resourcesTimeoutRef.current,
                                                            );
                                                        setShowResources(true);
                                                    }}
                                                    onMouseLeave={() => {
                                                        resourcesTimeoutRef.current = setTimeout(
                                                            () => setShowResources(false),
                                                            150,
                                                        );
                                                    }}
                                                />
                                            )}
                                        </AnimatePresence>
                                    )}
                                    {active && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-nprimary"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 500,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* CTA Button */}
                    <motion.button
                        onClick={handleAuth}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            'ml-4 bg-gradient-to-r from-nprimary to-[#6366f1] text-white text-[14.5px] font-medium h-10 px-6 rounded-full cursor-pointer',
                            'shadow-button transition-all duration-200',
                            'hover:shadow-[0_6px_20px_rgba(79,70,229,0.3)]',
                        )}
                    >
                        {session ? 'Go to Home' : 'Get Started'}
                    </motion.button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-dark-alpha/5 hover:bg-dark-alpha/10 transition-colors"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {isMobileMenuOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FiX size={20} className="text-dark-base" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="menu"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FiMenu size={20} className="text-dark-base" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                        className="fixed inset-x-0 top-20 z-40 md:hidden bg-white border-b border-dark-alpha/5 shadow-lg"
                    >
                        <div className="px-6 py-4 space-y-1">
                            {navItems.map((item, idx) => {
                                const active = isActive(item.redirectUrl);
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => {
                                            if (item.redirectUrl) {
                                                router.push(`/${item.redirectUrl}`);
                                            }
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={cn(
                                            'px-4 py-3.5 rounded-lg cursor-pointer transition-colors',
                                            active
                                                ? 'bg-nprimary/10 text-nprimary font-semibold'
                                                : 'text-dark-base/80 hover:text-dark-base hover:bg-dark-alpha/5',
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[15px] font-medium">
                                                {item.name}
                                            </span>
                                            {active && (
                                                <div className="w-2 h-2 rounded-full bg-nprimary" />
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: navItems.length * 0.05 }}
                                onClick={() => {
                                    handleAuth();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full mt-4 bg-gradient-to-r from-nprimary to-[#6366f1] text-white text-[15px] font-medium py-3.5 rounded-lg cursor-pointer shadow-button"
                            >
                                {session ? 'Go to Home' : 'Get Started'}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SigninModal />
        </>
    );
}

const navItems = [
    { name: 'Features', redirectUrl: '' },
    { name: 'About', redirectUrl: 'about' },
    { name: 'Premium', redirectUrl: 'premium' },
    { name: 'Resources', redirectUrl: '' },
];
