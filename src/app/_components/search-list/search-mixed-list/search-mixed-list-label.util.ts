import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';

let measureSpan: HTMLSpanElement | null = null;

export function buildNodeIdentifier(node: EqualComponentDescriptor): string {
    if (node.type === 'package') {
        return normalizePathSeparator(node.name);
    }

    if (node.type === 'route') {
        return normalizePathSeparator(`${node.package_name}\\route${node.name}`);
    }

    if (node.package_name) {
        return normalizePathSeparator(`${node.package_name}\\${node.name}`);
    }

    return normalizePathSeparator(node.name);
}

export function reducePathIteratively(path: string, hostElement?: HTMLElement, fallbackName?: string): string {
    if (!path) {
        return fallbackName || '';
    }

    const availableWidth = hostElement?.clientWidth ? hostElement?.clientWidth -1 : 0;
    if (!hostElement || availableWidth <= 0) {
        return fallbackName || path;
    }

    if (fitsInHost(path, hostElement, availableWidth)) {
        return path;
    }

    const segments = path.split('\\').filter(Boolean);
    if (segments.length <= 1) {
        return fallbackName || path;
    }

    const candidates: string[] = [];
    candidates.push(path);

    for (let tailCount = segments.length - 1; tailCount >= 1; tailCount--) {
        const tail = segments.slice(segments.length - tailCount).join('\\');
        candidates.push(`${segments[0]}\\...\\${tail}`);
    }

    for (let tailCount = segments.length - 1; tailCount >= 1; tailCount--) {
        const tail = segments.slice(segments.length - tailCount).join('\\');
        candidates.push(`...\\${tail}`);
    }

    candidates.push(segments[segments.length - 1]);

    let smallestCandidate = candidates[0];
    let smallestWidth = measureTextWidth(candidates[0], hostElement);

    for (const candidate of candidates) {
        const candidateWidth = measureTextWidth(candidate, hostElement);
        if (candidateWidth < smallestWidth) {
            smallestWidth = candidateWidth;
            smallestCandidate = candidate;
        }

        if (candidateWidth <= availableWidth) {
            if (candidate.startsWith('...\\')) {
                return candidate.split('\\')[1];
            }
            return candidate;
        }
    }

    return smallestCandidate || fallbackName || path;
}

function normalizePathSeparator(value: string): string {
    return (value || '').replace(/[\/]+/g, '\\');
}

function fitsInHost(text: string, hostElement: HTMLElement, availableWidth: number): boolean {
    return measureTextWidth(text, hostElement) <= availableWidth;
}

function measureTextWidth(text: string, hostElement: HTMLElement): number {
    const measurer = getMeasureSpan();
    if (!measurer) {
        return text.length * 8;
    }
    

    const computedStyle = window.getComputedStyle(hostElement);
    measurer.style.font = computedStyle.font;
    measurer.style.fontSize = computedStyle.fontSize;
    measurer.style.fontWeight = computedStyle.fontWeight;
    measurer.style.fontFamily = computedStyle.fontFamily;
    measurer.style.letterSpacing = computedStyle.letterSpacing;
    measurer.style.textTransform = computedStyle.textTransform;
    measurer.textContent = text;

    return measurer.offsetWidth;
}

function getMeasureSpan(): HTMLSpanElement | null {
    if (typeof document === 'undefined') {
        return null;
    }

    if (!measureSpan) {
        measureSpan = document.createElement('span');
        measureSpan.style.position = 'fixed';
        measureSpan.style.left = '-99999px';
        measureSpan.style.top = '-99999px';
        measureSpan.style.visibility = 'hidden';
        measureSpan.style.whiteSpace = 'nowrap';
        measureSpan.style.pointerEvents = 'none';
        document.body.appendChild(measureSpan);
    }

    return measureSpan;
}