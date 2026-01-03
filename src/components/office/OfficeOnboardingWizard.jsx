import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Building2, 
  Users, 
  MapPin, 
  Package, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Phone,
  Mail
} from 'lucide-react';

export default function OfficeOnboardingWizard({ user }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Company Profile
    company_name: '',
    company_industry: '',
    company_size: '',
    company_phone: '',
    contact_role: '',
    
    // Step 2: Team Preferences
    team_size: '',
    dietary_preferences: [],
    meal_frequency: '',
    
    // Step 3: Delivery Settings
    delivery_address: '',
    delivery_instructions: '',
    preferred_time: '',
    delivery_contact_name: '',
    delivery_contact_phone: '',
    
    // Step 4: Subscription
    preferred_plan: '',
    start_date: new Date().toISOString().split('T')[0]
  });

  const totalSteps = 4;

  const steps = [
    { id: 1, title: 'Perfil Empresa', icon: Building2 },
    { id: 2, title: 'Equipo', icon: Users },
    { id: 3, title: 'Entrega', icon: MapPin },
    { id: 4, title: 'Suscripción', icon: Package }
  ];

  const industries = [
    'Tecnología', 'Consultoría', 'Finanzas', 'Marketing', 'Educación', 
    'Salud', 'Legal', 'Inmobiliaria', 'Retail', 'Otro'
  ];

  const companySizes = [
    '1-10 empleados', '11-50 empleados', '51-200 empleados', '201-500 empleados', '500+ empleados'
  ];

  const dietaryOptions = [
    'Vegetariano', 'Vegano', 'Sin Gluten', 'Sin Lactosa', 'Halal', 'Kosher'
  ];

  const mealFrequencies = [
    'Diario (5 días/semana)', '3 días/semana', '2 días/semana', 'Ocasional'
  ];

  const plans = [
    { id: 'small', name: 'Pack Pequeño', menus: 20, price: 90 },
    { id: 'medium', name: 'Pack Medio', menus: 50, price: 210 },
    { id: 'large', name: 'Pack Grande', menus: 100, price: 390 }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDietaryPreference = (pref) => {
    setFormData(prev => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences.includes(pref)
        ? prev.dietary_preferences.filter(p => p !== pref)
        : [...prev.dietary_preferences, pref]
    }));
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        return formData.company_name && formData.company_industry && formData.company_size && formData.contact_role;
      case 2:
        return formData.team_size && formData.meal_frequency;
      case 3:
        return formData.delivery_address && formData.preferred_time;
      case 4:
        return formData.preferred_plan;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      alert('Por favor completa todos los campos obligatorios');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    if (!validateStep(4)) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        company_name: formData.company_name,
        company_industry: formData.company_industry,
        company_size: formData.company_size,
        company_phone: formData.company_phone,
        contact_role: formData.contact_role,
        team_size: formData.team_size,
        dietary_preferences: formData.dietary_preferences,
        meal_frequency: formData.meal_frequency,
        delivery_address: formData.delivery_address,
        delivery_instructions: formData.delivery_instructions,
        preferred_delivery_time: formData.preferred_time,
        delivery_contact_name: formData.delivery_contact_name,
        delivery_contact_phone: formData.delivery_contact_phone,
        preferred_plan: formData.preferred_plan,
        onboarding_completed: true
      });

      // Enviar email de bienvenida
      try {
        await base44.integrations.Core.SendEmail({
          to: 'piccas.entrepreneurship@gmail.com',
          subject: `🎉 Nuevo cliente Office - ${formData.company_name}`,
          body: `
¡Nueva empresa registrada en PlatPal Oficinas!

📊 INFORMACIÓN DE LA EMPRESA
━━━━━━━━━━━━━━━━━━━━━━
🏢 Empresa: ${formData.company_name}
🏭 Sector: ${formData.company_industry}
👥 Tamaño: ${formData.company_size}
📞 Teléfono: ${formData.company_phone || 'No proporcionado'}

👤 CONTACTO PRINCIPAL
━━━━━━━━━━━━━━━━━━━━━━
✉️ Email: ${user.email}
👔 Rol: ${formData.contact_role}

👥 EQUIPO Y PREFERENCIAS
━━━━━━━━━━━━━━━━━━━━━━
📊 Tamaño equipo: ${formData.team_size} personas
🍽️ Frecuencia: ${formData.meal_frequency}
🥗 Preferencias dietéticas: ${formData.dietary_preferences.length > 0 ? formData.dietary_preferences.join(', ') : 'Ninguna especial'}

📍 ENTREGA
━━━━━━━━━━━━━━━━━━━━━━
📍 Dirección: ${formData.delivery_address}
⏰ Horario preferido: ${formData.preferred_time}
📝 Instrucciones: ${formData.delivery_instructions || 'Ninguna'}
${formData.delivery_contact_name ? `👤 Contacto recepción: ${formData.delivery_contact_name}` : ''}
${formData.delivery_contact_phone ? `📱 Teléfono contacto: ${formData.delivery_contact_phone}` : ''}

📦 PLAN SELECCIONADO
━━━━━━━━━━━━━━━━━━━━━━
${plans.find(p => p.id === formData.preferred_plan)?.name} - ${plans.find(p => p.id === formData.preferred_plan)?.menus} menús/mes
💰 ${plans.find(p => p.id === formData.preferred_plan)?.price}€/mes
📅 Inicio: ${formData.start_date}

━━━━━━━━━━━━━━━━━━━━━━
🎯 Próximos pasos: Contactar para confirmar el primer pedido

PlatPal Oficinas - Menús Sostenibles
          `.trim()
        });
      } catch (emailError) {
        console.error('Error enviando email:', emailError);
      }

      navigate(createPageUrl('OfficeDashboard'));
    } catch (error) {
      console.error('Error guardando datos:', error);
      alert('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded transition-all ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-2 border-blue-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
              {steps[currentStep - 1].icon && React.createElement(steps[currentStep - 1].icon, { className: "w-7 h-7" })}
              Paso {currentStep} de {totalSteps}: {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Step 1: Company Profile */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Tip: Información básica de tu empresa</p>
                    <p>Esta información nos ayuda a personalizar el servicio según las necesidades de tu negocio.</p>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Nombre de la Empresa *</Label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    placeholder="Ej: Tech Innovations SL"
                    className="mt-2"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-semibold">Sector *</Label>
                    <Select value={formData.company_industry} onValueChange={(v) => handleChange('company_industry', v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecciona sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map(ind => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-semibold">Tamaño de la Empresa *</Label>
                    <Select value={formData.company_size} onValueChange={(v) => handleChange('company_size', v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Número de empleados" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-semibold">Tu Rol en la Empresa *</Label>
                    <Input
                      value={formData.contact_role}
                      onChange={(e) => handleChange('contact_role', e.target.value)}
                      placeholder="Ej: HR Manager, CEO, Office Manager"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Teléfono de Contacto
                    </Label>
                    <Input
                      value={formData.company_phone}
                      onChange={(e) => handleChange('company_phone', e.target.value)}
                      placeholder="+34 XXX XXX XXX"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Team Preferences */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-900">
                    <p className="font-semibold mb-1">Tip: Conoce a tu equipo</p>
                    <p>Cuéntanos sobre el tamaño de tu equipo y sus preferencias alimentarias para ofrecerte las mejores opciones.</p>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">¿Cuántas personas comen regularmente? *</Label>
                  <Input
                    type="number"
                    value={formData.team_size}
                    onChange={(e) => handleChange('team_size', e.target.value)}
                    placeholder="Ej: 15"
                    min="1"
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">Número aproximado de empleados que usarán el servicio</p>
                </div>

                <div>
                  <Label className="text-base font-semibold">Frecuencia deseada de menús *</Label>
                  <Select value={formData.meal_frequency} onValueChange={(v) => handleChange('meal_frequency', v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="¿Con qué frecuencia?" />
                    </SelectTrigger>
                    <SelectContent>
                      {mealFrequencies.map(freq => (
                        <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">Preferencias Dietéticas del Equipo</Label>
                  <p className="text-sm text-gray-600 mb-3">Selecciona todas las que apliquen</p>
                  <div className="flex flex-wrap gap-2">
                    {dietaryOptions.map(option => (
                      <Badge
                        key={option}
                        variant={formData.dietary_preferences.includes(option) ? "default" : "outline"}
                        className="cursor-pointer py-2 px-4 hover:scale-105 transition-all"
                        onClick={() => toggleDietaryPreference(option)}
                      >
                        {formData.dietary_preferences.includes(option) && <CheckCircle className="w-3 h-3 mr-1" />}
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Delivery Settings */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-purple-900">
                    <p className="font-semibold mb-1">Tip: Información de entrega</p>
                    <p>Proporciona detalles precisos para asegurar entregas sin complicaciones.</p>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Dirección de Entrega *</Label>
                  <Textarea
                    value={formData.delivery_address}
                    onChange={(e) => handleChange('delivery_address', e.target.value)}
                    placeholder="Calle, número, piso, código postal, ciudad"
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold">Instrucciones de Entrega</Label>
                  <Textarea
                    value={formData.delivery_instructions}
                    onChange={(e) => handleChange('delivery_instructions', e.target.value)}
                    placeholder="Ej: Tocar timbre de recepción, dejar en conserjería, 2º piso..."
                    rows={2}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold">Horario Preferido de Entrega *</Label>
                  <Select value={formData.preferred_time} onValueChange={(v) => handleChange('preferred_time', v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="¿Cuándo prefieres recibir?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="13:00-14:00">13:00 - 14:00</SelectItem>
                      <SelectItem value="14:00-15:00">14:00 - 15:00</SelectItem>
                      <SelectItem value="15:00-16:00">15:00 - 16:00</SelectItem>
                      <SelectItem value="16:00-17:00">16:00 - 17:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <Label className="text-sm font-semibold">Persona de Contacto en Recepción</Label>
                    <Input
                      value={formData.delivery_contact_name}
                      onChange={(e) => handleChange('delivery_contact_name', e.target.value)}
                      placeholder="Nombre"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Teléfono de Contacto</Label>
                    <Input
                      value={formData.delivery_contact_phone}
                      onChange={(e) => handleChange('delivery_contact_phone', e.target.value)}
                      placeholder="+34 XXX XXX XXX"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Subscription Plan */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <p className="font-semibold mb-1">Tip: Elige tu plan</p>
                    <p>Puedes cambiar o cancelar tu plan en cualquier momento. Sin permanencia.</p>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-4 block">Selecciona tu Plan Mensual *</Label>
                  <div className="grid md:grid-cols-3 gap-4">
                    {plans.map(plan => (
                      <Card
                        key={plan.id}
                        className={`cursor-pointer transition-all hover:shadow-xl ${
                          formData.preferred_plan === plan.id 
                            ? 'border-2 border-blue-600 bg-blue-50' 
                            : 'border-2 border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => handleChange('preferred_plan', plan.id)}
                      >
                        <CardContent className="p-6 text-center">
                          {formData.preferred_plan === plan.id && (
                            <Badge className="mb-3 bg-blue-600">Seleccionado</Badge>
                          )}
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                          <div className="text-3xl font-black text-blue-600 mb-2">{plan.menus}</div>
                          <p className="text-sm text-gray-600 mb-4">menús/mes</p>
                          <div className="text-2xl font-bold text-gray-900">{plan.price}€</div>
                          <p className="text-xs text-gray-500 mt-1">€{(plan.price / plan.menus).toFixed(2)}/menú</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Fecha de Inicio</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-2"
                  />
                </div>

                <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    ¿Qué incluye tu plan?
                  </h4>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Menús completos recuperados de cafeterías locales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Dashboard corporativo para gestión</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Informes mensuales de impacto ambiental</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Soporte directo del equipo PlatPal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Sin permanencia - Cancela cuando quieras</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 px-8"
                >
                  {isSaving ? 'Guardando...' : 'Completar Registro'}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Help */}
        <Card className="mt-6 border-2 border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">¿Necesitas ayuda?</p>
                <p className="text-sm text-gray-600">Estamos aquí para ayudarte</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-gray-600">📧 piccas.entrepreneurship@gmail.com</p>
              <p className="text-gray-600">📞 +34 624 29 76 36</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}