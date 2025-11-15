import { useState } from "react";

export default function UserForm({ onSubmit }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
    age: "",
    gender: "",
    location: "",
    numberOfChildren: "",
    firstTimeParent: false,
    preferredLanguage: "",
    allergies: "",
    medications: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold text-slate-800 mb-6">
        Parent Profile
      </h1>

      <form
        onSubmit={submitForm}
        className="bg-white shadow-lg rounded-2xl p-8 space-y-6"
        style={{ background: "#FAFCFF" }}
      >
        {/* grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* First Name */}
          <div>
            <label className="block text-slate-700 mb-1 font-medium">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              value={form.firstName}
              onChange={handleChange}
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-slate-700 mb-1 font-medium">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-slate-700 mb-1 font-medium">
              Birthday
            </label>
            <input
              type="date"
              name="birthday"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              value={form.birthday}
              onChange={handleChange}
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-slate-700 mb-1 font-medium">Age</label>
            <input
              type="number"
              name="age"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              value={form.age}
              onChange={handleChange}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-slate-700 mb-1 font-medium">
              Gender
            </label>
            <select
              name="gender"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">Select gender...</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="nonbinary">Non-binary</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-slate-700 mb-1 font-medium">
              Location
            </label>
            <input
              type="text"
              name="location"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              placeholder="City, Country"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          {/* Number of Children */}
          <div>
            <label className="block text-slate-700 mb-1 font-medium">
              Number of Children
            </label>
            <input
              type="number"
              name="numberOfChildren"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              value={form.numberOfChildren}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* First Time Parent */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="firstTimeParent"
            checked={form.firstTimeParent}
            onChange={handleChange}
            className="w-5 h-5 rounded"
          />
          <label className="text-slate-700 font-medium">
            First-Time Parent
          </label>
        </div>

        {/* Preferred Language */}
        <div>
          <label className="block text-slate-700 mb-1 font-medium">
            Preferred Language
          </label>
          <select
            name="preferredLanguage"
            className="w-full rounded-xl border border-slate-300 px-4 py-2 bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
            value={form.preferredLanguage}
            onChange={handleChange}
          >
            <option value="">Select language...</option>
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
          </select>
        </div>

        {/* Allergies */}
        <div>
          <label className="block text-slate-700 mb-1 font-medium">
            Allergies
          </label>
          <textarea
            name="allergies"
            className="w-full rounded-xl border border-slate-300 px-4 py-2 min-h-[80px] focus:ring-2 focus:ring-blue-300 focus:outline-none"
            placeholder="List any allergies..."
            value={form.allergies}
            onChange={handleChange}
          />
        </div>

        {/* Medications */}
        <div>
          <label className="block text-slate-700 mb-1 font-medium">
            Medications
          </label>
          <textarea
            name="medications"
            className="w-full rounded-xl border border-slate-300 px-4 py-2 min-h-[80px] focus:ring-2 focus:ring-blue-300 focus:outline-none"
            placeholder="List current medications..."
            value={form.medications}
            onChange={handleChange}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-xl text-lg font-medium hover:bg-blue-600 transition"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}
