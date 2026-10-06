type ModelDescriptor = {
    providerID: string;
    modelID: string;
};
export declare function resolveValidFullscanVariant(client: unknown, model: ModelDescriptor | undefined, variant: string | undefined): Promise<string | undefined>;
export {};
