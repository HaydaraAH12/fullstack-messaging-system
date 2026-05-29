import { SidebarMoveDirection } from '@mail-system/shared';
import { IsEnum } from 'class-validator';

export { SidebarMoveDirection };

export class MoveSidebarItemDto {
  @IsEnum(SidebarMoveDirection)
  direction!: SidebarMoveDirection;
}
