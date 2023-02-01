import {ZephyrusMultipleSelector} from '../components';
import {useZephyrusSelector} from './useZephyrusSelector';
import {SelectorHookProps, ZephyrusSelectorType} from '../types';

export function useZephyrusMultipleSelector<T extends string>({dataList, identifier, identifiers}: SelectorHookProps<T>) {
  const {
    value,
    SelectorComponent: Selector,
  } = useZephyrusSelector({
    dataList,
    type: ZephyrusSelectorType.TextWithIcon,
    identifier: identifiers?.value,
  });
  const {
    value: otherValue,
    SelectorComponent: OtherSelector,
  } = useZephyrusSelector({
    dataList,
    type: ZephyrusSelectorType.TextWithIcon,
    identifier: identifiers?.value,
  });

  const multipleSelectorComponent = () => (
    <ZephyrusMultipleSelector identifier={identifier}>
      <Selector />
      <OtherSelector />
    </ZephyrusMultipleSelector>
  );

  return {
    value,
    otherValue,
    MultipleSelectorComponent: multipleSelectorComponent,
  };
}
