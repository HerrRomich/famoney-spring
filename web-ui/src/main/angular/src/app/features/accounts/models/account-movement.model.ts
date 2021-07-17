export interface MovementDialogData {
  readonly accountId: number;
  readonly movementId?: number;
}

export interface MovementDate {
  date: moment.Moment;
  bookingDate?: moment.Moment;
  budgetPeriod?: moment.Moment;
}

export interface AccountMovement {
  movementDate?: MovementDate;
}
