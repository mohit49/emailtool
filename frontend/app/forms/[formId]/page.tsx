'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import AuthHeader from '../../../components/AuthHeader';
import Alert from '../../../components/Alert';
import { ChevronLeft, Save, Trash2, Plus, X, GripVertical, ChevronRight, ChevronLeft as ChevronLeftIcon } from 'lucide-react';

const API_URL = '/api';

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'tel' | 'url';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  stepId?: string;
}

interface FormStep {
  id: string;
  title: string;
  description?: string;
  order: number;
}

interface Form {
  _id: string;
  formId: string;
  name: string;
  formType: 'subscription' | 'survey' | 'contact' | 'custom' | 'quiz';
  projectId: string;
  userId: string;
  fields: FormField[];
  steps?: FormStep[];
  status: 'draft' | 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export default function FormBuilderPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const formId = params.formId as string;
  const projectId = searchParams.get('projectId');

  const [projectInfo, setProjectInfo] = useState<{ name: string; role: 'owner' | 'ProjectAdmin' | 'emailDeveloper' } | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({
    isOpen: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !token || !formId || !projectId) {
        setLoading(false);
        return;
      }

      try {
        // Verify project access
        const projectResponse = await axios.get(`${API_URL}/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjectInfo({
          name: projectResponse.data.project.name,
          role: projectResponse.data.project.role,
        });

        // Fetch form
        const formResponse = await axios.get(`${API_URL}/forms/${formId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedForm = formResponse.data.form;
        // Initialize steps for survey forms if not present
        if (fetchedForm.formType === 'survey' && (!fetchedForm.steps || fetchedForm.steps.length === 0)) {
          fetchedForm.steps = [{
            id: `step-${Date.now()}`,
            title: 'Step 1',
            description: '',
            order: 0,
          }];
        }
        setForm(fetchedForm);
      } catch (error: any) {
        console.error('Fetch error:', error);
        if (error.response?.status === 403 || error.response?.status === 404) {
          router.push('/forms');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token, formId, projectId, router]);

  const addField = (stepId?: string) => {
    if (!form) return;
    
    const newField: FormField = {
      id: `field-${Date.now()}`,
      name: `field_${form.fields.length + 1}`,
      label: 'New Field',
      type: 'text',
      required: false,
      placeholder: '',
      stepId: stepId || (form.formType === 'survey' && form.steps && form.steps.length > 0 ? form.steps[0].id : undefined),
    };
    
    setForm({
      ...form,
      fields: [...form.fields, newField],
    });
  };

  const addStep = () => {
    if (!form || form.formType !== 'survey') return;
    
    const newStep: FormStep = {
      id: `step-${Date.now()}`,
      title: `Step ${(form.steps?.length || 0) + 1}`,
      description: '',
      order: form.steps?.length || 0,
    };
    
    setForm({
      ...form,
      steps: [...(form.steps || []), newStep],
    });
  };

  const removeStep = (stepId: string) => {
    if (!form) return;
    
    // Remove step and reassign its fields to first step
    const firstStepId = form.steps && form.steps.length > 0 ? form.steps[0].id : undefined;
    const updatedFields = form.fields.map(f => 
      f.stepId === stepId ? { ...f, stepId: firstStepId } : f
    );
    
    setForm({
      ...form,
      steps: form.steps?.filter(s => s.id !== stepId).map((s, idx) => ({ ...s, order: idx })) || [],
      fields: updatedFields,
    });
  };

  const updateStep = (stepId: string, updates: Partial<FormStep>) => {
    if (!form) return;
    
    setForm({
      ...form,
      steps: form.steps?.map(s => s.id === stepId ? { ...s, ...updates } : s) || [],
    });
  };

  const removeField = (fieldId: string) => {
    if (!form) return;
    setForm({
      ...form,
      fields: form.fields.filter(f => f.id !== fieldId),
    });
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!form) return;
    
    setForm({
      ...form,
      fields: form.fields.map(f => 
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    });
  };

  const addOption = (fieldId: string, option: string) => {
    if (!form) return;
    
    setForm({
      ...form,
      fields: form.fields.map(f => {
        if (f.id === fieldId) {
          const options = f.options || [];
          if (!options.includes(option.trim())) {
            return { ...f, options: [...options, option.trim()] };
          }
        }
        return f;
      }),
    });
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    if (!form) return;
    
    setForm({
      ...form,
      fields: form.fields.map(f => {
        if (f.id === fieldId && f.options) {
          return { ...f, options: f.options.filter((_, i) => i !== optionIndex) };
        }
        return f;
      }),
    });
  };

  const handleSave = async () => {
    if (!form) return;

    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/forms/${formId}`,
        {
          name: form.name,
          formType: form.formType,
          fields: form.fields,
          steps: form.steps || [],
          status: form.status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAlert({
        isOpen: true,
        message: 'Form saved successfully',
        type: 'success',
      });
    } catch (error: any) {
      setAlert({
        isOpen: true,
        message: error.response?.data?.error || 'Failed to save form',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!form || !projectInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Form Not Found</h2>
          <Link href={`/forms?projectId=${projectId}`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Go to Forms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <AuthHeader showProjectInfo={projectInfo} projectId={projectId || ''} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/forms?projectId=${projectId}`}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{form.name}</h1>
                <p className="text-sm text-gray-500 mt-1">Form ID: <code className="bg-gray-100 px-1 rounded">{form.formId}</code></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Form Builder */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Type
              </label>
              <select
                value={form.formType}
                onChange={(e) => setForm({ ...form, formType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="subscription">Subscription Form</option>
                <option value="survey">Survey Form</option>
                <option value="contact">Contact Us Form</option>
                <option value="custom">Custom Form</option>
                <option value="quiz">Quiz Form</option>
              </select>
            </div>

            {/* Steps Management for Survey Forms */}
            {form.formType === 'survey' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Form Steps</h2>
                  <button
                    onClick={addStep}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Step
                  </button>
                </div>

                {form.steps && form.steps.length > 0 ? (
                  <div className="space-y-4">
                    {form.steps.map((step, stepIndex) => {
                      const stepFields = form.fields.filter(f => f.stepId === step.id);
                      return (
                        <div key={step.id} className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-semibold">
                                  Step {stepIndex + 1}
                                </span>
                                <input
                                  type="text"
                                  value={step.title}
                                  onChange={(e) => updateStep(step.id, { title: e.target.value })}
                                  className="flex-1 px-3 py-1 border border-purple-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                  placeholder="Step Title"
                                />
                              </div>
                              <input
                                type="text"
                                value={step.description || ''}
                                onChange={(e) => updateStep(step.id, { description: e.target.value })}
                                className="w-full px-3 py-1 border border-purple-300 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                placeholder="Step description (optional)"
                              />
                            </div>
                            {form.steps && form.steps.length > 1 && (
                              <button
                                onClick={() => removeStep(step.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
                                title="Remove step"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-medium text-gray-700">Fields in this step</h3>
                              <button
                                onClick={() => addField(step.id)}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
                              >
                                <Plus className="w-3 h-3" />
                                Add Field
                              </button>
                            </div>

                            {stepFields.length === 0 ? (
                              <div className="text-center py-6 border-2 border-dashed border-purple-300 rounded-lg bg-white">
                                <p className="text-gray-500 text-sm mb-2">No fields in this step</p>
                                <button
                                  onClick={() => addField(step.id)}
                                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                                >
                                  Add Field
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {stepFields.map((field) => (
                                  <div key={field.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                                    <div className="flex items-start gap-3">
                                      <div className="flex-1 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Field Name *</label>
                                            <input
                                              type="text"
                                              value={field.name}
                                              onChange={(e) => updateField(field.id, { name: e.target.value })}
                                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                              placeholder="field_name"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Label *</label>
                                            <input
                                              type="text"
                                              value={field.label}
                                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                              placeholder="Field Label"
                                            />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                                            <select
                                              value={field.type}
                                              onChange={(e) => {
                                                const newType = e.target.value as FormField['type'];
                                                const updates: Partial<FormField> = { type: newType };
                                                if (!['select', 'radio', 'checkbox'].includes(newType)) {
                                                  updates.options = [];
                                                }
                                                updateField(field.id, updates);
                                              }}
                                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                              <option value="text">Text</option>
                                              <option value="email">Email</option>
                                              <option value="number">Number</option>
                                              <option value="textarea">Textarea</option>
                                              <option value="select">Select</option>
                                              <option value="checkbox">Checkbox</option>
                                              <option value="radio">Radio</option>
                                              <option value="date">Date</option>
                                              <option value="tel">Phone</option>
                                              <option value="url">URL</option>
                                            </select>
                                          </div>
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Placeholder</label>
                                            <input
                                              type="text"
                                              value={field.placeholder || ''}
                                              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                              placeholder="Placeholder"
                                            />
                                          </div>
                                        </div>
                                        {['select', 'radio', 'checkbox'].includes(field.type) && (
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Options</label>
                                            <div className="space-y-1">
                                              {field.options?.map((option, optIndex) => (
                                                <div key={optIndex} className="flex items-center gap-2">
                                                  <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => {
                                                      const newOptions = [...(field.options || [])];
                                                      newOptions[optIndex] = e.target.value;
                                                      updateField(field.id, { options: newOptions });
                                                    }}
                                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                  />
                                                  <button
                                                    onClick={() => removeOption(field.id, optIndex)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                  >
                                                    <X className="w-3 h-3" />
                                                  </button>
                                                </div>
                                              ))}
                                              <button
                                                onClick={() => {
                                                  const newOption = prompt('Enter option:');
                                                  if (newOption) addOption(field.id, newOption);
                                                }}
                                                className="px-2 py-1 text-xs text-indigo-600 border border-indigo-300 rounded hover:bg-indigo-50"
                                              >
                                                + Add Option
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                          <label className="flex items-center gap-2">
                                            <input
                                              type="checkbox"
                                              checked={field.required}
                                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                                            />
                                            <span className="text-xs text-gray-700">Required</span>
                                          </label>
                                          <button
                                            onClick={() => removeField(field.id)}
                                            className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded flex items-center gap-1"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 mb-4">No steps yet</p>
                    <button
                      onClick={addStep}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add Your First Step
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Fields List for Non-Survey Forms */}
            {form.formType !== 'survey' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Form Fields</h2>
                  <button
                    onClick={() => addField()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Field
                  </button>
                </div>

                {form.fields.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 mb-4">No fields yet</p>
                  <button
                    onClick={addField}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add Your First Field
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.fields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 pt-2 text-gray-400">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Field Name *
                              </label>
                              <input
                                type="text"
                                value={field.name}
                                onChange={(e) => updateField(field.id, { name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                                placeholder="field_name"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Label *
                              </label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="Field Label"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Field Type *
                              </label>
                              <select
                                value={field.type}
                                onChange={(e) => {
                                  const newType = e.target.value as FormField['type'];
                                  const updates: Partial<FormField> = { type: newType };
                                  // Clear options if not needed
                                  if (!['select', 'radio', 'checkbox'].includes(newType)) {
                                    updates.options = [];
                                  }
                                  updateField(field.id, updates);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                              >
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="number">Number</option>
                                <option value="textarea">Textarea</option>
                                <option value="select">Select</option>
                                <option value="checkbox">Checkbox</option>
                                <option value="radio">Radio</option>
                                <option value="date">Date</option>
                                <option value="tel">Phone</option>
                                <option value="url">URL</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Placeholder
                              </label>
                              <input
                                type="text"
                                value={field.placeholder || ''}
                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="Enter placeholder text"
                              />
                            </div>
                          </div>

                          {/* Options for select, radio, checkbox */}
                          {['select', 'radio', 'checkbox'].includes(field.type) && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-2">
                                Options
                              </label>
                              <div className="space-y-2">
                                {field.options?.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...(field.options || [])];
                                        newOptions[optIndex] = e.target.value;
                                        updateField(field.id, { options: newOptions });
                                      }}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                      placeholder="Option value"
                                    />
                                    <button
                                      onClick={() => removeOption(field.id, optIndex)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    const newOption = prompt('Enter option value:');
                                    if (newOption) {
                                      addOption(field.id, newOption);
                                    }
                                  }}
                                  className="px-3 py-1 text-sm text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
                                >
                                  + Add Option
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <span className="text-sm text-gray-700">Required</span>
                            </label>
                            <button
                              onClick={() => removeField(field.id)}
                              className="ml-auto px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
    </div>
  );
}

