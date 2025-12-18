import { Building2 } from 'lucide-react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                 <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    PT Maju Bersama
                </span>
                <span className="text-xs text-muted-foreground">Sistem Informasi Sarana dan Prasarana</span>
            </div>
        </>
    );
}
