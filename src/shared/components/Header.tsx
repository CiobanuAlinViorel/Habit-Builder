'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { logout } from '@/shared/actions/LogoutAction'

const NAV_LINKS = [
    { href: '/habits', label: 'Habits' },
    { href: '/statistics', label: 'Statistics' },
]

type HeaderUser = { name: string; email: string } | null

const AuthActions = ({
    user,
    variant = 'row',
}: {
    user: HeaderUser
    variant?: 'row' | 'column'
}) => {
    const isColumn = variant === 'column'

    if (user) {
        return (
            <div className={isColumn ? 'flex flex-col gap-3' : 'flex items-center gap-3'}>
                <Link
                    href="/profile"
                    aria-label="User account"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-blue-royal to-brand-emerald text-sm font-semibold text-brand-offwhite transition-opacity hover:opacity-80 ${isColumn ? 'self-start' : ''}`}
                >
                    {user.name.charAt(0).toUpperCase()}
                </Link>
                <form action={logout}>
                    <button
                        type="submit"
                        className="rounded-md border border-brand-slate/40 px-4 py-2 text-sm font-medium text-brand-offwhite transition-colors hover:bg-white/5"
                    >
                        Log out
                    </button>
                </form>
            </div>
        )
    }

    return (
        <div className={isColumn ? 'flex flex-col gap-3' : 'flex items-center gap-3'}>
            <Link
                href="/login"
                className="rounded-md border border-brand-slate/40 px-4 py-2 text-sm font-medium text-brand-offwhite transition-colors hover:bg-white/5"
            >
                Log in
            </Link>
            <Link
                href="/register"
                className="rounded-md bg-brand-emerald px-4 py-2 text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-mint"
            >
                Sign up
            </Link>
        </div>
    )
}

const Header = ({ user }: { user: HeaderUser }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="border-b border-white/10 bg-brand-blue-deep px-4 sm:px-6 py-2">
            <div className="flex items-center justify-between lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-2">
                <Link href="/" aria-label="Habit Builder home" className="flex items-center ">
                    <Image
                        src="/logo.png"
                        alt="Habit Builder"
                        width={1020}
                        height={771}
                        priority
                        className="h-9 w-auto sm:h-14 lg:h-20 bg-white rounded-2xl p-2"
                    />
                </Link>

                <nav className="hidden items-center justify-center gap-12 lg:flex">
                    {NAV_LINKS.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className="group relative py-2 text-lg font-semibold text-brand-offwhite transition-all duration-300 hover:-translate-y-0.5 hover:text-brand-cyan-light"
                        >
                            {label}
                            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-center scale-x-0 rounded-full bg-linear-to-r from-brand-cyan-light to-brand-mint transition-transform duration-300 ease-out group-hover:scale-x-100" />
                        </Link>
                    ))}
                </nav>

                <div className="hidden lg:flex lg:justify-self-end">
                    <AuthActions user={user} />
                </div>

                <button
                    type="button"
                    onClick={() => setIsMenuOpen(true)}
                    aria-label="Open menu"
                    className="flex h-9 w-9 items-center justify-center text-brand-offwhite lg:hidden"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                </button>
            </div>

            {/* Backdrop */}
            <div
                onClick={() => setIsMenuOpen(false)}
                aria-hidden={!isMenuOpen}
                className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
            />

            {/* Slide-in drawer (mobile & tablet) */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                className={`fixed inset-y-0 right-0 z-50 flex w-72 max-w-[80%] flex-col gap-6 bg-brand-blue-deep p-6 shadow-xl transition-transform duration-300 lg:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-brand-offwhite">Menu</span>
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Close menu"
                        className="flex h-9 w-9 items-center justify-center text-brand-offwhite"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>

                <nav className="flex flex-col gap-4 text-sm font-medium">
                    {NAV_LINKS.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setIsMenuOpen(false)}
                            className="text-brand-offwhite transition-colors hover:text-brand-cyan-light"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                <AuthActions user={user} variant="column" />
            </div>
        </header>
    )
}

export default Header
