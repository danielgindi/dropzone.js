export interface DropZoneOptions {
    /**
     * Selector expression/element to append to the dropzone.
     * Defaults to `null`.
     */
    append?: string | Element | null;

    /**
     * A function that determines whether we allow dropping or not.
     */
    allowDrop?: (dataTransfer: DataTransfer) => boolean;
}

export class DropZone {
    /**
     * @param el - The element to attach the dropzone to
     * @param options - Dropzone configuration options
     */
    constructor(el: Element, options?: DropZoneOptions);

    /**
     * Clean up and remove the dropzone.
     */
    destroy(): void;
}
