import { ClipLoader } from "react-spinners";

const Spinner = ({ size, color }: { size: number, color: string }) => <ClipLoader className="w-max h-max m-auto my-3" color={color} size={size} />;

export default Spinner;