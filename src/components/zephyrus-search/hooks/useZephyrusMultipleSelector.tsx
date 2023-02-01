import {ZephyrusMultipleSelector} from '../components';
import {useZephyrusSelector} from './useZephyrusSelector';
import {SelectorHookProps, SelectorType} from '../types';

export function useZephyrusMultipleSelector({dataList, identifier, identifiers}: SelectorHookProps) {
  const {
    value,
    SelectorComponent: Selector,
  } = useZephyrusSelector({
    dataList,
    type: SelectorType.TextWithIcon,
    identifier: identifiers?.value,
  });
  const {
    value: otherValue,
    SelectorComponent: OtherSelector,
  } = useZephyrusSelector({
    dataList,
    type: SelectorType.TextWithIcon,
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
