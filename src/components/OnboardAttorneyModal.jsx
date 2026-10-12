import { useState, useEffect } from 'react'
import Icon from './common/Icon.jsx'
import { Button } from './ui/Button.jsx'
import { attorneyService } from '../api/services/attorneyService.js'
import { uploadPublicAsset } from '../api/services/fileService.js'
import CapsuleInput from './common/CapsuleInput.jsx'

const fieldLabel = 'block text-xs font-medium text-zinc-500 dark:text-zinc-400'
const fieldInput =
  'mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-brand focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-brand/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50'

export default function OnboardAttorneyModal({ open, onClose, onCreated, editAttorney }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    barLicenseNumber: '',
    federalCircuit: '',
    firm: '',
    yearsOfExperience: '',
    languages: [],
    specialties: [],
    about: ''
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    return () => {
      if (photoPreview && !editAttorney?.avatarUrl?.includes(photoPreview)) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview, editAttorney])

  useEffect(() => {
    if (editAttorney) {
      setForm({
        name: editAttorney.name || '',
        email: editAttorney.email || '',
        barLicenseNumber: editAttorney.barLicenseNumber || '',
        federalCircuit: editAttorney.federalCircuit || '',
        firm: editAttorney.address?.city || '',
        yearsOfExperience: editAttorney.yearsOfExperience?.toString() || '',
        languages: editAttorney.languageProficiencies || [],
        specialties: editAttorney.specialties || [],
        about: editAttorney.about || ''
      })
      if (editAttorney.avatarUrl) {
        setPhotoPreview(editAttorney.avatarUrl)
      } else {
        setPhotoPreview(null)
      }
    } else {
      setForm({
        name: '', email: '', barLicenseNumber: '', federalCircuit: '', 
        firm: '', yearsOfExperience: '', languages: [], specialties: [], about: ''
      })
      setPhotoPreview(null)
    }
    setPhotoFile(null)
  }, [editAttorney, open])

  if (!open) return null

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('File must be less than 5MB')
      return
    }

    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Specialties is required, fallback if empty
    const specialtiesList = [...form.specialties]
    if (specialtiesList.length === 0) {
      specialtiesList.push('General Practice')
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      barLicenseNumber: form.barLicenseNumber.trim() || undefined,
      federalCircuit: form.federalCircuit.trim() || undefined,
      yearsOfExperience: parseInt(form.yearsOfExperience) || 0,
      languageProficiencies: form.languages,
      specialties: specialtiesList,
      about: form.about.trim() || undefined,
    }

    if (form.firm.trim()) {
      payload.address = {
        city: form.firm.trim()
      }
    }

    try {
      setIsLoading(true)

      let finalAvatarUrl = null
      if (photoFile) {
        const { url } = await uploadPublicAsset(photoFile)
        finalAvatarUrl = url
      }

      if (finalAvatarUrl) {
        payload.avatarUrl = finalAvatarUrl
      }

      let res
      if (editAttorney) {
        res = await attorneyService.updateAttorney(editAttorney.id, payload)
      } else {
        throw new Error('Manual attorney create is disabled; use Import Attorneys')
      }
      
      onCreated(res.data?.data || res.data)
      setForm({
        name: '', email: '', barLicenseNumber: '', federalCircuit: '', 
        firm: '', yearsOfExperience: '', languages: [], specialties: [], about: ''
      })
      setPhotoFile(null)
      setPhotoPreview(null)
      onClose()
    } catch (err) {
      console.error('Failed to save attorney', err)
      alert('Failed to save attorney')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-zinc-900"
      >
        <div className="flex items-start justify-between border-b border-zinc-100 p-6 pb-4 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              {editAttorney ? 'Edit Attorney' : 'Add Attorney'}
            </h2>
            <p className="mt-1 text-base text-zinc-500 dark:text-zinc-400">
              {editAttorney
                ? 'Update the details for this attorney.'
                : 'Attorneys are imported from the automation pipeline. Use Edit from the list to update a record.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-brand/20"
              />
            ) : (
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                <Icon name="image" size={20} />
              </span>
            )}
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Profile Photo
              </p>
              <p className="text-xs text-zinc-400">
                Upload a professional headshot (JPG, PNG, max 5MB)
              </p>
              <label className="mt-1.5 inline-block cursor-pointer rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:border-brand/40 hover:text-brand dark:border-zinc-700 dark:text-zinc-300">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                Upload Image
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabel}>Legal Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Julian Vance"
                className={fieldInput}
                required
              />
            </div>
            <div>
              <label className={fieldLabel}>Institutional Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="j.vance@firm.com"
                className={fieldInput}
              />
            </div>
            <div>
              <label className={fieldLabel}>Bar License Number</label>
              <input 
                name="barLicenseNumber"
                value={form.barLicenseNumber}
                onChange={handleChange}
                placeholder="NY-882910" 
                className={fieldInput} 
              />
            </div>
            <div>
              <label className={fieldLabel}>Federal Circuit</label>
              <select name="federalCircuit" value={form.federalCircuit} onChange={handleChange} className={fieldInput}>
                <option value="">Select Circuit</option>
                <option value="2nd Circuit">2nd Circuit</option>
                <option value="5th Circuit">5th Circuit</option>
                <option value="9th Circuit">9th Circuit</option>
                <option value="11th Circuit">11th Circuit</option>
              </select>
            </div>
          </div>

          <div>
            <label className={fieldLabel}>Office Location</label>
            <input
              name="firm"
              value={form.firm}
              onChange={handleChange}
              placeholder="e.g. New York, NY"
              className={fieldInput}
            />
          </div>

          <div>
            <label className={fieldLabel}>Years of Experience</label>
            <input 
              name="yearsOfExperience"
              type="number"
              value={form.yearsOfExperience}
              onChange={handleChange}
              placeholder="e.g. 12" 
              className={fieldInput} 
            />
          </div>

          <div>
            <label className={fieldLabel}>Language Proficiencies (Press Enter)</label>
            <CapsuleInput
              value={form.languages}
              onChange={(val) => setForm(prev => ({ ...prev, languages: val }))}
              placeholder="e.g. English, Spanish"
              className="mt-1.5 w-full"
            />
          </div>

          <div>
            <label className={fieldLabel}>Specialties (Press Enter)</label>
            <CapsuleInput
              value={form.specialties}
              onChange={(val) => setForm(prev => ({ ...prev, specialties: val }))}
              placeholder="e.g. Civil Rights, Federal Litigation"
              className="mt-1.5 w-full"
            />
          </div>

          <div>
            <label className={fieldLabel}>About / Professional Summary</label>
            <textarea
              name="about"
              value={form.about}
              onChange={handleChange}
              rows={3}
              placeholder="Enter professional background, specialties, and relevant experience..."
              className={fieldInput + ' resize-none'}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-100 p-6 pt-4 dark:border-zinc-800">
          <Button variant="ghost" onClick={onClose} type="button" disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {editAttorney ? 'Save Changes' : 'Add Attorney'}
          </Button>
        </div>
      </form>
    </div>
  )
}
