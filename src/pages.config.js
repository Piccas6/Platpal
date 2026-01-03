import AdminCafeteriaApproval from './pages/AdminCafeteriaApproval';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import BonoSuccess from './pages/BonoSuccess';
import Bonos from './pages/Bonos';
import BulkUpload from './pages/BulkUpload';
import CafeteriaDashboard from './pages/CafeteriaDashboard';
import CafeteriaDetails from './pages/CafeteriaDetails';
import CafeteriaOnboarding from './pages/CafeteriaOnboarding';
import Campus from './pages/Campus';
import Community from './pages/Community';
import Confirmation from './pages/Confirmation';
import CrearCafeteria from './pages/CrearCafeteria';
import EditMenu from './pages/EditMenu';
import FAQ from './pages/FAQ';
import GestionarCafeterias from './pages/GestionarCafeterias';
import Home from './pages/Home';
import Impact from './pages/Impact';
import ImpactDashboard from './pages/ImpactDashboard';
import InvestorForm from './pages/InvestorForm';
import ManagerDashboard from './pages/ManagerDashboard';
import MenuTemplates from './pages/MenuTemplates';
import Menus from './pages/Menus';
import NotFound from './pages/NotFound';
import OfficeDashboard from './pages/OfficeDashboard';
import OfficeHome from './pages/OfficeHome';
import OfficeMenus from './pages/OfficeMenus';
import OfficeOnboarding from './pages/OfficeOnboarding';
import OfficePacks from './pages/OfficePacks';
import OfficeSuccess from './pages/OfficeSuccess';
import PaymentFlow from './pages/PaymentFlow';
import PickupPanel from './pages/PickupPanel';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import PublishMenu from './pages/PublishMenu';
import RegistroCafeteria from './pages/RegistroCafeteria';
import Reports from './pages/Reports';
import SEOBlog from './pages/SEOBlog';
import SolicitarCafeteria from './pages/SolicitarCafeteria';
import SystemCheck from './pages/SystemCheck';
import TermsOfService from './pages/TermsOfService';
import TestPayments from './pages/TestPayments';
import UploadDocumentsCafeteria from './pages/UploadDocumentsCafeteria';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminCafeteriaApproval": AdminCafeteriaApproval,
    "AdminDashboard": AdminDashboard,
    "AnalyticsDashboard": AnalyticsDashboard,
    "BonoSuccess": BonoSuccess,
    "Bonos": Bonos,
    "BulkUpload": BulkUpload,
    "CafeteriaDashboard": CafeteriaDashboard,
    "CafeteriaDetails": CafeteriaDetails,
    "CafeteriaOnboarding": CafeteriaOnboarding,
    "Campus": Campus,
    "Community": Community,
    "Confirmation": Confirmation,
    "CrearCafeteria": CrearCafeteria,
    "EditMenu": EditMenu,
    "FAQ": FAQ,
    "GestionarCafeterias": GestionarCafeterias,
    "Home": Home,
    "Impact": Impact,
    "ImpactDashboard": ImpactDashboard,
    "InvestorForm": InvestorForm,
    "ManagerDashboard": ManagerDashboard,
    "MenuTemplates": MenuTemplates,
    "Menus": Menus,
    "NotFound": NotFound,
    "OfficeDashboard": OfficeDashboard,
    "OfficeHome": OfficeHome,
    "OfficeMenus": OfficeMenus,
    "OfficeOnboarding": OfficeOnboarding,
    "OfficePacks": OfficePacks,
    "OfficeSuccess": OfficeSuccess,
    "PaymentFlow": PaymentFlow,
    "PickupPanel": PickupPanel,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "PublishMenu": PublishMenu,
    "RegistroCafeteria": RegistroCafeteria,
    "Reports": Reports,
    "SEOBlog": SEOBlog,
    "SolicitarCafeteria": SolicitarCafeteria,
    "SystemCheck": SystemCheck,
    "TermsOfService": TermsOfService,
    "TestPayments": TestPayments,
    "UploadDocumentsCafeteria": UploadDocumentsCafeteria,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};