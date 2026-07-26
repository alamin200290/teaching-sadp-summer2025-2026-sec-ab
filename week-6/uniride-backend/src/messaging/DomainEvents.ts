// Topic names for the in-process event broker (Week 6).
export const Topics = { RideConfirmed: "ride.confirmed" } as const;
export type Topic = (typeof Topics)[keyof typeof Topics];
