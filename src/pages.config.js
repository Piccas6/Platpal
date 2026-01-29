/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
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
import PWASetup from './pages/PWASetup';
import PaymentFlow from './pages/PaymentFlow';
import PickupPanel from './pages/PickupPanel';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import PublishMenu from './pages/PublishMenu';
import RegistroCafeteria from './pages/RegistroCafeteria';
import Reports from './pages/Reports';
import SEOBlog from './pages/SEOBlog';
import SolicitarCafeteria from './pages/SolicitarCafeteria';
import SurpriseMenu from './pages/SurpriseMenu';
import SystemCheck from './pages/SystemCheck';
import TermsOfService from './pages/TermsOfService';
import TestPayments from './pages/TestPayments';
import UploadDocumentsCafeteria from './pages/UploadDocumentsCafeteria';
import VoicePublishMenu from './pages/VoicePublishMenu';
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
    "PWASetup": PWASetup,
    "PaymentFlow": PaymentFlow,
    "PickupPanel": PickupPanel,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "PublishMenu": PublishMenu,
    "RegistroCafeteria": RegistroCafeteria,
    "Reports": Reports,
    "SEOBlog": SEOBlog,
    "SolicitarCafeteria": SolicitarCafeteria,
    "SurpriseMenu": SurpriseMenu,
    "SystemCheck": SystemCheck,
    "TermsOfService": TermsOfService,
    "TestPayments": TestPayments,
    "UploadDocumentsCafeteria": UploadDocumentsCafeteria,
    "VoicePublishMenu": VoicePublishMenu,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};