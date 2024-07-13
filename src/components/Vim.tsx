import { VimProps } from '@/types';
import dynamic from 'next/dynamic';

const VimComponent = dynamic(() => import('./VimComponent'), { ssr: false });

const Vim: React.FC<VimProps> = (props) => {
    return <VimComponent {...props} />;
};

export default Vim;