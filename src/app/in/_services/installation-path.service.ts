import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class InstallationPathService {
    private readonly storageKey = 'workbenchInstallationPath';
    private detectedSeparator: '/' | '\\' = '/';

    constructor(private router: Router) {}

    public getCurrentInstallationPath(): string {
        if (typeof window === 'undefined') {
            return this.getSeparator();
        }

        const configuredPath = localStorage.getItem(this.storageKey);
        if (configuredPath) {
            return this.normalizeInstallationPath(configuredPath) || this.getSeparator();
        }

        const pathname = window.location.pathname || '/';
        const routerPath = this.getCurrentRouterPath();
        const installationPath = pathname.endsWith(routerPath)
            ? pathname.slice(0, pathname.length - routerPath.length)
            : pathname;

        return this.normalizeInstallationPath(installationPath) || this.getSeparator();
    }

    public setInstallationPath(path: string): string {
        const normalizedPath = this.normalizeInstallationPath(path);
        if (normalizedPath) {
            localStorage.setItem(this.storageKey, normalizedPath);
        }
        return normalizedPath;
    }

    public changeInstallationPath(path: string): void {
        const normalizedPath = this.setInstallationPath(path);
        if (!normalizedPath || typeof window === 'undefined') {
            return;
        }

        if (this.isBrowserPath(normalizedPath)) {
            const separator = this.getSeparator();
            const basePathWithoutTrailing = normalizedPath.replace(new RegExp(`[${separator === '\\' ? '\\\\' : '/'}]+$`), '');
            const targetPath = `${basePathWithoutTrailing}${this.getCurrentRouterPath()}`;
            window.location.assign(targetPath);
        }
    }

    public normalizeInstallationPath(path: string): string {
        const trimmed = path.trim();
        if (!trimmed) {
            return '';
        }

        // Detect separator from input path
        this.detectSeparatorFromPath(trimmed);

        if (/^https?:\/\//i.test(trimmed)) {
            try {
                const parsedUrl = new URL(trimmed);
                const normalizedPathname = parsedUrl.pathname.replace(/\/+$/, '') || this.getSeparator();
                const trailingChar = normalizedPathname.endsWith(this.getSeparator()) ? '' : this.getSeparator();
                return `${normalizedPathname}${trailingChar}`;
            } catch {
                return '';
            }
        }

        if (/^[a-zA-Z]:[\\/]/.test(trimmed)) {
            const sep = this.getSeparator();
            const normalized = trimmed.split(/[\\/]/).filter(p => p).join(sep);
            return normalized.endsWith(sep) ? normalized : `${normalized}${sep}`;
        }

        const sep = this.getSeparator();
        const pathParts = trimmed.split(/[\\/]/).filter(p => p);
        if (pathParts.length === 0) {
            return sep;
        }
        const withLeadingSeparator = pathParts.join(sep);
        return `${sep}${withLeadingSeparator}${sep}`;
    }

    private detectSeparatorFromPath(path: string): void {
        // Check which separator is used in the path
        if (path.includes('\\')) {
            this.detectedSeparator = '\\';
        } else if (path.includes('/')) {
            this.detectedSeparator = '/';
        }
    }

    public getSeparator(): '/' | '\\' {
        return this.detectedSeparator;
    }

    public setSeparator(separator: '/' | '\\'): void {
        this.detectedSeparator = separator;
    }

    private getCurrentRouterPath(): string {
        const currentRouterUrl = this.router.url || '/';
        const normalizedRouterUrl = currentRouterUrl.startsWith('/') ? currentRouterUrl : `/${currentRouterUrl}`;
        const [pathOnly] = normalizedRouterUrl.split(/[?#]/);
        return pathOnly || '/';
    }

    private isBrowserPath(path: string): boolean {
        return /^https?:\/\//i.test(path) || path.startsWith('/');
    }
}