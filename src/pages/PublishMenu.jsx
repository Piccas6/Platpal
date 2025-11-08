
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Check, Repeat, ImageIcon, Sparkles, Recycle, UtensilsCrossed, AlertTriangle, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import withAuth from "../components/auth/withAuth";

const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const campusOptions = [
    { id: 'jerez', name: 'Campus Jerez' },
    { id: 'puerto_real', name: 'Campus Puerto Real' },
    { id: 'cadiz', name: 'Campus Cádiz' },
    { id: 'algeciras', name: 'Campus Algeciras' }
];

const tipoCocinaOptions = [
    { id: 'mediterranea', name: 'Mediterránea' },
    { id: 'italiana', name: 'Italiana' },
    { id: 'asiatica', name: 'Asiática' },
    { id: 'mexicana', name: 'Mexicana' },
    { id: 'vegetariana', name: 'Vegetariana' },
    { id: 'casera', name: 'Casera' },
    { id: 'internacional', name: 'Internacional' },
    { id: 'rapida', name: 'Comida Rápida' },
    { id: 'otra', name: 'Otra' }
];

const alergenosOptions = [
    { id: 'gluten', name: 'Gluten' },
    { id: 'lacteos', name: 'Lácteos' },
    { id: 'huevos', name: 'Huevos' },
    { id: 'pescado', name: 'Pescado' },
    { id: 'frutos_secos', name: 'Frutos Secos' },
    { id: 'soja', name: 'Soja' },
    { id: 'ninguno', name: 'Ninguno' }
];

function PublishMenu({ user }) {
    const navigate = useNavigate();
    const location = useLocation();
    const templateData = location?.state?.templateData;
    const duplicateFrom = location?.state?.duplicateFrom;
    
    // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
    const [availableCafeterias, setAvailableCafeterias] = useState([]);
    const [selectedCafeteria, setSelectedCafeteria] = useState(null);

    const [formData, setFormData] = useState({
        plato_principal: templateData?.plato_principal || duplicateFrom?.plato_principal || "",
        plato_secundario: templateData?.plato_secundario || duplicateFrom?.plato_secundario || "",
        precio_original: duplicateFrom?.precio_original || "8.50", // Default, will be updated by selectedCafeteria
        precio_descuento: 2.99,
        stock_total: duplicateFrom?.stock_total || "",
        stock_disponible: "",
        hora_limite_reserva: duplicateFrom?.hora_limite_reserva || "16:00", // Default, will be updated by selectedCafeteria
        hora_limite: duplicateFrom?.hora_limite || "18:00", // Default, will be updated by selectedCafeteria
        fecha: duplicateFrom?.fecha || new Date().toISOString().split('T')[0],
        // campus and cafeteria are now determined by selectedCafeteria, not in formData directly
        es_recurrente: false,
        es_sorpresa: false,
        dias_semana: [],
        permite_envase_propio: templateData?.permite_envase_propio ?? duplicateFrom?.permite_envase_propio ?? true,
        descuento_envase_propio: templateData?.descuento_envase_propio || duplicateFrom?.descuento_envase_propio || 0.15,
        tipo_cocina: templateData?.tipo_cocina || duplicateFrom?.tipo_cocina || "",
        es_vegetariano: templateData?.es_vegetariano || duplicateFrom?.es_vegetariano || false,
        es_vegano: templateData?.es_vegano || duplicateFrom?.es_vegano || false,
        sin_gluten: templateData?.sin_gluten || duplicateFrom?.sin_gluten || false,
        alergenos: templateData?.alergenos || duplicateFrom?.alergenos || []
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [generatingImage, setGeneratingImage] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    useEffect(() => {
        const loadCafeterias = async () => {
            try {
                const allCafeterias = await base44.entities.Cafeteria.list();
                let filteredCafeterias = [];

                if (user?.app_role === 'admin') {
                    filteredCafeterias = allCafeterias.filter(c => c.activa);
                } else if (user?.app_role === 'cafeteria' && user.cafeterias_asignadas && user.cafeterias_asignadas.length > 0) {
                    filteredCafeterias = allCafeterias.filter(c =>
                        user.cafeterias_asignadas.includes(c.id) && c.activa
                    );
                }
                setAvailableCafeterias(filteredCafeterias);

                if (filteredCafeterias.length > 0) {
                    const initialSelected = duplicateFrom ? 
                        filteredCafeterias.find(c => c.nombre === duplicateFrom.cafeteria && c.campus === duplicateFrom.campus) || filteredCafeterias[0] :
                        filteredCafeterias[0];

                    setSelectedCafeteria(initialSelected);

                    // Update formData with defaults from the selected cafeteria
                    setFormData(prev => ({
                        ...prev,
                        precio_original: duplicateFrom?.precio_original || initialSelected.precio_original_default || "8.50",
                        hora_limite_reserva: duplicateFrom?.hora_limite_reserva || initialSelected.hora_fin_reserva || "16:00",
                        hora_limite: duplicateFrom?.hora_limite || initialSelected.hora_fin_recogida || "18:00"
                    }));
                }
            } catch (error) {
                console.error("Error loading cafeterias:", error);
            }
        };

        if (user) {
            loadCafeterias();
        }
    }, [user, duplicateFrom]);

    // NOW WE CAN DO CONDITIONAL CHECKS AFTER ALL HOOKS
    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSwitchChange = (field) => (checked) => {
        if (field === 'es_recurrente') {
            setFormData(prev => ({ ...prev, es_recurrente: checked, dias_semana: checked ? prev.dias_semana : [] }));
        } else if (field === 'es_sorpresa') {
            setFormData(prev => ({
                ...prev,
                es_sorpresa: checked,
                plato_principal: checked ? "Plato Sorpresa" : "",
                plato_secundario: checked ? "2º Plato Sorpresa" : ""
            }));
        } else if (field === 'permite_envase_propio') {
            setFormData(prev => ({ ...prev, permite_envase_propio: checked }));
        }
    };

    const handleDayToggle = (day) => {
        setFormData(prev => {
            const newDias = new Set(prev.dias_semana);
            if (newDias.has(day)) {
                newDias.delete(day);
            } else {
                newDias.add(day);
            }
            return { ...prev, dias_semana: Array.from(newDias) };
        });
    };

    const handleAlergenoToggle = (alergeno) => {
        setFormData(prev => {
            const newAlergenos = new Set(prev.alergenos);
            if (alergeno === 'ninguno') {
                return { ...prev, alergenos: newAlergenos.has('ninguno') ? [] : ['ninguno'] };
            }
            
            newAlergenos.delete('ninguno');
            
            if (newAlergenos.has(alergeno)) {
                newAlergenos.delete(alergeno);
            } else {
                newAlergenos.add(alergeno);
            }
            return { ...prev, alergenos: Array.from(newAlergenos) };
        });
    };

    const generateMenuImage = async () => {
        if (!formData.plato_principal && !formData.es_sorpresa) return null;

        setGeneratingImage(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            let prompt;
            if (formData.es_sorpresa) {
                prompt = `Minimalist modern takeaway food box, clean solid background, trendy aesthetic`;
            } else {
                prompt = `Minimalist flat lay ${formData.plato_principal} and ${formData.plato_secundario}, clean pastel background, natural lighting`;
            }

            const response = await base44.integrations.Core.GenerateImage({ prompt });
            setGeneratedImage(response.url);
            return response.url;
        } catch (error) {
            console.error("Error generating image:", error);
            return null;
        } finally {
            setGeneratingImage(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsConfirmDialogOpen(true);
    };

    const handleActualPublish = async () => {
        setIsLoading(true);
        try {
            if (!selectedCafeteria) {
                alert("Por favor selecciona una cafetería.");
                setIsLoading(false);
                setIsConfirmDialogOpen(false);
                return;
            }

            const imageUrl = await generateMenuImage();

            const baseMenuData = {
                ...formData,
                precio_original: parseFloat(formData.precio_original),
                precio_descuento: 2.99,
                stock_total: parseInt(formData.stock_total),
                stock_disponible: parseInt(formData.stock_total),
                descuento_envase_propio: parseFloat(formData.descuento_envase_propio),
                imagen_url: imageUrl,
                plato_principal: formData.es_sorpresa ? "Plato Sorpresa" : formData.plato_principal,
                plato_secundario: formData.es_sorpresa ? "2º Plato Sorpresa" : formData.plato_secundario,
                es_recurrente: formData.es_recurrente && formData.dias_semana.length > 0,
                tipo_cocina: formData.tipo_cocina,
                es_vegetariano: formData.es_vegetariano,
                es_vegano: formData.es_vegano,
                sin_gluten: formData.sin_gluten,
                alergenos: formData.alergenos.length > 0 ? formData.alergenos : ['ninguno'],
                campus: selectedCafeteria.campus,
                cafeteria: selectedCafeteria.nombre
            };

            const menusToCreate = [];

            if (formData.es_recurrente && formData.dias_semana.length > 0) {
                // The first menu is the one from the form's date
                menusToCreate.push(baseMenuData);
                
                const dayMap = { "Lunes": 1, "Martes": 2, "Miércoles": 3, "Jueves": 4, "Viernes": 5 };
                const initialFormDate = new Date(formData.fecha + 'T00:00:00');
                
                for (let week = 0; week < 8; week++) {
                    for (const dayName of formData.dias_semana) {
                        const targetDayOfWeek = dayMap[dayName];
                        const currentWeekStartDate = new Date(initialFormDate);
                        currentWeekStartDate.setDate(currentWeekStartDate.getDate() + (week * 7));

                        let daysToAdd = (targetDayOfWeek - currentWeekStartDate.getDay() + 7) % 7;
                        // Adjust daysToAdd if targetDayOfWeek is before currentDayOfWeek in the same week
                        if (daysToAdd < 0) daysToAdd += 7;

                        const finalMenuDate = new Date(currentWeekStartDate);
                        finalMenuDate.setDate(finalMenuDate.getDate() + daysToAdd);
                        
                        // Ensure we don't duplicate the initial menu and only create future menus
                        if (finalMenuDate.setHours(0,0,0,0) > initialFormDate.setHours(0,0,0,0)) {
                            menusToCreate.push({
                                ...baseMenuData,
                                fecha: finalMenuDate.toISOString().split('T')[0],
                                es_recurrente: false, // Subsequent menus are not recurrent themselves
                                dias_semana: []
                            });
                        }
                    }
                }
            } else {
                menusToCreate.push({ ...baseMenuData, es_recurrente: false });
            }
            
            // Filter out duplicate dates if initialFormDate was one of the recurrent days
            const uniqueMenus = Array.from(new Map(menusToCreate.map(m => [m.fecha, m])).values());
            
            if (uniqueMenus.length > 0) {
                await base44.entities.Menu.bulkCreate(uniqueMenus);
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            navigate(createPageUrl("CafeteriaDashboard"), { 
                state: { refreshData: true, timestamp: Date.now() }
            });
        } catch (error) {
            console.error("Error publishing menu:", error);
            alert("Error al publicar el menú. Por favor, intenta de nuevo.");
        } finally {
            setIsLoading(false);
            setIsConfirmDialogOpen(false);
        }
    };

    // Check permissions
    const hasRoleIssues = (user?.app_role !== 'cafeteria' && user?.app_role !== 'admin');

    if (hasRoleIssues) {
        const issues = [];
        issues.push(`Tu rol actual es "${user?.app_role || 'No asignado'}", necesitas rol "cafeteria" o "admin"`);
        
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6 md:p-8 flex items-center justify-center">
                <Card className="max-w-2xl w-full border-2 border-red-200">
                    <CardHeader className="text-center bg-red-50 border-b">
                        <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                        <CardTitle className="text-2xl text-red-800">⚠️ No puedes publicar menús</CardTitle>
                        <p className="text-red-600 mt-2">Tu rol no te permite publicar menús.</p>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-4 mb-6">
                            <h3 className="font-bold text-lg text-gray-900">Problemas detectados:</h3>
                            {issues.map((issue, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-800 font-medium">{issue}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                            <h3 className="font-bold text-blue-900 mb-2">📋 Tu información actual:</h3>
                            <ul className="space-y-1 text-sm">
                                <li><strong>Email:</strong> {user?.email || 'No disponible'}</li>
                                <li><strong>Rol:</strong> {user?.app_role || 'No asignado'}</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <Link to={createPageUrl("Profile")} className="block">
                                <Button className="w-full bg-gradient-to-r from-emerald-600 to-amber-500 hover:from-emerald-700 hover:to-amber-600">
                                    Ir a Mi Perfil
                                </Button>
                            </Link>
                            <Link to={createPageUrl("CafeteriaDashboard")}>
                                <Button variant="outline" className="w-full">
                                    Volver al Dashboard
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Check if user has cafeterias assigned based on roles/cafeterias_asignadas.
    // This check determines if the user *should* have cafeterias, not if they are currently loaded.
    const hasCafeteriasAssigned = (user?.cafeterias_asignadas && user.cafeterias_asignadas.length > 0) || user?.app_role === 'admin';
    
    // If user has right role but no cafeterias assigned OR no active ones were loaded
    if (!selectedCafeteria && hasCafeteriasAssigned && availableCafeterias.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
                 <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                 <p className="ml-2 text-emerald-700">Cargando cafeterías...</p>
            </div>
        );
    }

    if (!hasCafeteriasAssigned || (availableCafeterias.length === 0 && !selectedCafeteria)) { // Added !selectedCafeteria for clarity in case availableCafeterias remains empty
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6 md:p-8 flex items-center justify-center">
                <Card className="max-w-2xl w-full border-2 border-red-200">
                    <CardHeader className="text-center bg-red-50 border-b">
                        <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                        <CardTitle className="text-2xl text-red-800">⚠️ No tienes cafeterías asignadas</CardTitle>
                        <p className="text-red-600 mt-2">Necesitas que un administrador te asigne al menos una cafetería activa.</p>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                            <h3 className="font-bold text-blue-900 mb-2">📋 Tu información actual:</h3>
                            <ul className="space-y-1 text-sm">
                                <li><strong>Email:</strong> {user?.email || 'No disponible'}</li>
                                <li><strong>Rol:</strong> {user?.app_role || 'No asignado'}</li>
                                <li><strong>Cafeterías Asignadas (IDs):</strong> {user?.cafeterias_asignadas?.join(', ') || 'Ninguna'}</li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <Link to={createPageUrl("Profile")} className="block">
                                <Button className="w-full" variant="outline">
                                    Ver Mi Perfil
                                </Button>
                            </Link>
                            <Link to={createPageUrl("CafeteriaDashboard")}>
                                <Button className="w-full bg-emerald-600">
                                    Volver al Dashboard
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const showWarning = !selectedCafeteria?.precio_original_default;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to={createPageUrl("CafeteriaDashboard")}>
                        <Button variant="outline" size="icon" className="rounded-2xl border-2">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Publicar Nuevo Menú</h1>
                        <p className="text-gray-600 mt-2">Completa los detalles del menú</p>
                    </div>
                </div>

                {showWarning && (
                    <Card className="mb-6 border-yellow-200 bg-yellow-50">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-yellow-900 mb-2">Advertencia:</h3>
                                    <p className="text-sm text-yellow-800">• La cafetería actual no tiene un precio original por defecto configurado.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="shadow-lg border-2">
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* NUEVO: Selector de Cafetería */}
                            {availableCafeterias.length > 1 && (
                                <div className="p-4 bg-gradient-to-r from-emerald-50 to-amber-50 rounded-2xl border-2 border-emerald-200">
                                    <Label className="font-semibold text-emerald-900 mb-3 block">
                                        🏪 Publicar en cafetería:
                                    </Label>
                                    <Select 
                                        value={selectedCafeteria?.id} 
                                        onValueChange={(id) => {
                                            const cafe = availableCafeterias.find(c => c.id === id);
                                            setSelectedCafeteria(cafe);
                                            // Actualizar valores por defecto según la cafetería seleccionada
                                            setFormData(prev => ({
                                                ...prev,
                                                // Only update if duplicateFrom is not present, otherwise preserve its value
                                                precio_original: duplicateFrom?.precio_original || cafe?.precio_original_default || "8.50",
                                                hora_limite_reserva: duplicateFrom?.hora_limite_reserva || cafe?.hora_fin_reserva || "16:00",
                                                hora_limite: duplicateFrom?.hora_limite || cafe?.hora_fin_recogida || "18:00"
                                            }));
                                        }}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Selecciona una cafetería" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableCafeterias.map(cafe => (
                                                <SelectItem key={cafe.id} value={cafe.id}>
                                                    {cafe.nombre} - {campusOptions.find(c => c.id === cafe.campus)?.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {availableCafeterias.length === 1 && selectedCafeteria && (
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                                    <p className="text-sm text-emerald-800">
                                        <strong>Publicando en:</strong> {selectedCafeteria.nombre} - {campusOptions.find(c => c.id === selectedCafeteria.campus)?.name}
                                    </p>
                                </div>
                            )}

                            <div className="p-4 border rounded-2xl space-y-4 bg-blue-50/30">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="es_sorpresa" className="flex items-center gap-2 font-semibold">
                                        <Sparkles className="w-4 h-4 text-purple-700"/>
                                        ¿Es un plato sorpresa?
                                    </Label>
                                    <Switch id="es_sorpresa" checked={formData.es_sorpresa} onCheckedChange={handleSwitchChange('es_sorpresa')} />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="plato_principal">Plato Principal</Label>
                                    <Input
                                        id="plato_principal"
                                        value={formData.plato_principal}
                                        onChange={handleInputChange}
                                        required
                                        disabled={formData.es_sorpresa}
                                        className={formData.es_sorpresa ? "bg-purple-50" : ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="plato_secundario">2º Plato</Label>
                                    <Input
                                        id="plato_secundario"
                                        value={formData.plato_secundario}
                                        onChange={handleInputChange}
                                        required
                                        disabled={formData.es_sorpresa}
                                        className={formData.es_sorpresa ? "bg-purple-50" : ""}
                                    />
                                </div>
                            </div>

                            {/* Removed Campus and Cafetería (Automático) sections as they are replaced by the Select/static display */}

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="precio_original">Precio Original (€)</Label>
                                    <Input 
                                        id="precio_original" 
                                        type="number" 
                                        step="0.01" 
                                        value={formData.precio_original} 
                                        onChange={handleInputChange} 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Precio PlatPal (€)</Label>
                                    <div className="p-3 bg-emerald-50 rounded-xl">
                                        <span className="text-xl font-bold text-emerald-600">€2.99</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock_total">Cantidad</Label>
                                    <Input id="stock_total" type="number" value={formData.stock_total} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fecha">Fecha</Label>
                                    <Input id="fecha" type="date" value={formData.fecha} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hora_limite_reserva">Límite Reservar</Label>
                                    <Input id="hora_limite_reserva" type="time" value={formData.hora_limite_reserva} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hora_limite">Límite Recoger</Label>
                                    <Input id="hora_limite" type="time" value={formData.hora_limite} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <div className="p-4 border rounded-2xl space-y-4 bg-purple-50/30">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <UtensilsCrossed className="w-4 h-4" />
                                    Clasificación
                                </h3>
                                
                                <div className="space-y-2">
                                    <Label>Tipo de Cocina</Label>
                                    <Select value={formData.tipo_cocina} onValueChange={(value) => setFormData(prev => ({...prev, tipo_cocina: value}))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tipoCocinaOptions.map(tipo => (
                                                <SelectItem key={tipo.id} value={tipo.id}>{tipo.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                                        <Label className="text-sm">🥗 Vegetariano</Label>
                                        <Switch checked={formData.es_vegetariano} onCheckedChange={(checked) => setFormData(prev => ({...prev, es_vegetariano: checked}))} />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                                        <Label className="text-sm">🌱 Vegano</Label>
                                        <Switch checked={formData.es_vegano} onCheckedChange={(checked) => setFormData(prev => ({...prev, es_vegano: checked}))} />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                                        <Label className="text-sm">🌾 Sin Gluten</Label>
                                        <Switch checked={formData.sin_gluten} onCheckedChange={(checked) => setFormData(prev => ({...prev, sin_gluten: checked}))} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Alérgenos</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {alergenosOptions.map(alergeno => (
                                            <button
                                                type="button"
                                                key={alergeno.id}
                                                onClick={() => handleAlergenoToggle(alergeno.id)}
                                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                                                    formData.alergenos.includes(alergeno.id)
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-white hover:bg-gray-100'
                                                }`}
                                            >
                                                {alergeno.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border rounded-2xl space-y-4 bg-green-50/30">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2 font-semibold">
                                        <Recycle className="w-4 h-4 text-green-700"/>
                                        ¿Permitir envase propio?
                                    </Label>
                                    <Switch checked={formData.permite_envase_propio} onCheckedChange={handleSwitchChange('permite_envase_propio')} />
                                </div>
                                {formData.permite_envase_propio && (
                                    <div className="space-y-2">
                                        <Label htmlFor="descuento_envase_propio">Descuento (€)</Label>
                                        <Input
                                            id="descuento_envase_propio"
                                            type="number"
                                            step="0.01"
                                            value={formData.descuento_envase_propio}
                                            onChange={handleInputChange}
                                            className="w-32"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border rounded-2xl space-y-4 bg-emerald-50/30">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2 font-semibold">
                                        <Repeat className="w-4 h-4 text-emerald-700"/>
                                        ¿Menú recurrente?
                                    </Label>
                                    <Switch checked={formData.es_recurrente} onCheckedChange={handleSwitchChange('es_recurrente')} />
                                </div>
                                {formData.es_recurrente && (
                                    <div className="space-y-2">
                                        <Label>Días de la semana</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {dias.map(dia => (
                                                <button
                                                    type="button"
                                                    key={dia}
                                                    onClick={() => handleDayToggle(dia)}
                                                    className={`px-3 py-1 text-sm rounded-full border ${
                                                        formData.dias_semana.includes(dia)
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-white hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {dia}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(formData.plato_principal || formData.es_sorpresa) && (
                                <div className="p-4 border rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <Label className="flex items-center gap-2 font-semibold">
                                            <ImageIcon className="w-4 h-4 text-purple-700"/>
                                            Vista previa de imagen
                                        </Label>
                                        <Button type="button" variant="outline" size="sm" onClick={generateMenuImage} disabled={generatingImage || !selectedCafeteria}>
                                            {generatingImage ? 'Generando...' : 'Generar'}
                                        </Button>
                                    </div>
                                    {generatingImage && (
                                        <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                                            <div className="text-center space-y-2">
                                                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                <p className="text-sm text-gray-600">Generando imagen...</p>
                                            </div>
                                        </div>
                                    )}
                                    {generatedImage && !generatingImage && (
                                        <img src={generatedImage} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                                    )}
                                    {!generatedImage && !generatingImage && (
                                        <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                                            <p className="text-gray-500">Haz clic para generar</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <Button type="submit" disabled={isLoading || generatingImage || !selectedCafeteria} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl py-3 font-semibold">
                                {isLoading ? 'Publicando...' : (formData.es_recurrente ? 'Publicar Menús Recurrentes' : 'Publicar Menú')}
                                <Check className="w-5 h-5 ml-2" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar publicación?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de publicar un nuevo menú. {formData.es_recurrente && "Se crearán copias para 8 semanas."} ¿Confirmar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsConfirmDialogOpen(false)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleActualPublish} disabled={isLoading}>
                            {isLoading ? 'Publicando...' : 'Confirmar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default withAuth(PublishMenu, ['cafeteria', 'admin']);
