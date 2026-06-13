import { getStatusColor } from '../../utils/formatters';

export default function Badge({ status, label }) {
  return (
    <span className={`badge ${getStatusColor(status)}`}>
      {label || status}
    </span>
  );
}