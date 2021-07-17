import { RefundDataDto } from '@famoney-apis/accounts';
import { AccountMovement, MovementDialogData } from './account-movement.model';

export interface RefundDialogData extends MovementDialogData {
  readonly refundData?: RefundDataDto;
}

export interface AccountRefund extends AccountMovement {}
