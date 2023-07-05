declare module "*.scss" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.svg" {
  const content: TSVGModule;
  export default content;
}

declare module "*.json" {
  const value: any;
  export default value;
}