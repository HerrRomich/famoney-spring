import { EntryDataDto } from '@famoney-apis/accounts';
import { AccountMovement, MovementDialogData } from './account-movement.model';

export interface EntryDialogData extends MovementDialogData {
  readonly entryData?: EntryDataDto;
}

export interface AccountEntry extends AccountMovement {
  entryItems: EntryItem[];
}

export interface EntryItem {
  categoryId: number;
  amount: string;
  comments?: string;
}
