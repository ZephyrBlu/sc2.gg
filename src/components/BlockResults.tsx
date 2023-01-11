type BlockResult = {
  element: JSX.Element,
  value: string,
  count?: number,
}

interface Props {
  title: string;
  query?: string;
  results: BlockResult[];
  loading: boolean;
  max?: number;
}

export function BlockResults({
  title,
  query,
  results,
  loading,
  max = 20,
}: Props) {
  return (
    <div className="BlockResults">
      
    </div>
  );
}
