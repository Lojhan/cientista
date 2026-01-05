export const Verbosity = {
  Silent: 0,
  Verbose: 1,
} as const;

export type Verbosity = (typeof Verbosity)[keyof typeof Verbosity];
