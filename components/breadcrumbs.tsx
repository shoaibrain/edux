"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";

export function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    return (
        <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-foreground capitalize">{segments[0] || 'Dashboard'}</Link></li>
                {segments.slice(1).map((segment, index) => {
                    const href = `/${segments.slice(0, index + 2).join('/')}`;
                    const isLast = index === segments.length - 2;
                    return (
                        <Fragment key={href}>
                            <li className="text-muted-foreground">/</li>
                            <li>
                                {isLast ? (
                                    <span className="font-medium text-foreground capitalize">{segment}</span>
                                ) : (
                                    <Link href={href} className="hover:text-foreground capitalize">{segment}</Link>
                                )}
                            </li>
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}