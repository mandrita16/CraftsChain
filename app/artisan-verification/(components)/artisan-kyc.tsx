"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  CheckCircle,
  MapPin,
  Camera,
  Wallet,
  Shield,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { useArtisanSBTMint } from "@/hooks/useArtisanSBTMint"

const craftTypes = [
  "Kantha",
  "Dokra",
  "Terracotta",
  "Madhubani",
  "Pattachitra",
  "Bamboo Craft",
  "Brass Work",
  "Pottery",
  "Handloom",
  "Wood Carving",
  "Other",
]

export default function ArtisanKYC() {
  const { isConnected, address } = useAccount();
  const { mintArtisanNFT, isPending, isConfirming, isSuccess, isError, error, transactionHash } = useArtisanSBTMint();
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
    idType: "aadhaar",
    craftType: "",
    otherCraftType: "",
    address: "",
    useGeolocation: false,
    geolocation: null,
    documents: [],
    walletConnected: isConnected,
    walletAddress: address,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const fileInputRef = useRef(null)

  // Add this useEffect to watch for transaction success
  useEffect(() => {
    if (isSuccess && transactionHash) {
      // Only show success screen after transaction confirms
      setIsSubmitted(true);
      setIsSubmitting(false);
    }
  }, [isSuccess, transactionHash]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...files],
      }))

      if (errors.documents) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.documents
          return newErrors
        })
      }
    }
  }

  const removeDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }))
  }

  const getGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            geolocation: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            useGeolocation: true,
          }))
        },
        (error) => {
          console.error("Error getting geolocation:", error)
          setFormData((prev) => ({
            ...prev,
            useGeolocation: false,
          }))
        },
      )
    }
  }

  const validateStep = (currentStep) => {
    const newErrors = {}

    if (currentStep === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required"
      if (!formData.idNumber.trim()) newErrors.idNumber = "ID number is required"
      if (formData.idType === "aadhaar" && !/^\d{12}$/.test(formData.idNumber)) {
        newErrors.idNumber = "Aadhaar number must be 12 digits"
      }
    } else if (currentStep === 2) {
      if (!formData.craftType) newErrors.craftType = "Please select a craft type"
      if (formData.craftType === "Other" && !formData.otherCraftType.trim()) {
        newErrors.otherCraftType = "Please specify your craft"
      }
      if (!formData.address.trim()) newErrors.address = "Address is required"
    } else if (currentStep === 3) {
      if (formData.documents.length === 0) newErrors.documents = "Please upload at least one document"
    } else if (currentStep === 4) {
      if (!formData.walletConnected) newErrors.wallet = "Please connect your wallet"
      if (!formData.agreeTerms) newErrors.terms = "Please agree to the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    if (validateStep(step)) {
      // Don't submit if already submitted or pending
      if (isSubmitting || isSubmitted) return;
      
      setIsSubmitting(true);
  
      try {
        // Call the contract to mint the NFT
        if (formData.walletConnected) {
          const verificationId = await mintArtisanNFT(formData);
          
          // Store verification ID for display
          setFormData(prev => ({
            ...prev,
            verificationId
          }));
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setIsSubmitting(false);
      }
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-8">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                stepNumber === step
                  ? "bg-gradient-to-r from-cyan-500 to-red-600 text-white"
                  : stepNumber < step
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-500"
              }`}
              initial={{ scale: stepNumber === step ? 0.8 : 1 }}
              animate={{ scale: stepNumber === step ? 1 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {stepNumber < step ? <CheckCircle className="w-5 h-5" /> : <span>{stepNumber}</span>}
            </motion.div>
            {stepNumber < 4 && <div className={`w-10 h-1 ${stepNumber < step ? "bg-gray-800" : "bg-gray-200"}`}></div>}
          </div>
        ))}
      </div>
    )
  }

  const renderStepContent = () => {
  if (isSubmitted) {
    return (
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
          <p className="font-medium">
            Verification ID: <span className="font-normal">{formData.verificationId || "Processing..."}</span>
          </p>
          <p className="font-medium">
            Submitted on: <span className="font-normal">{new Date().toLocaleDateString()}</span>
          </p>
          {transactionHash && (
            <p className="font-medium">
              Transaction: <a 
                href={`https://sepolia.basescan.org/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                View on Base Sepolia Scan <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          )}
        </div>
        <div className="flex justify-center mb-6">
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-red-600 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
        </div>
        <h2 className="text-2xl font-bold mb-4">Verification Request Submitted!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for submitting your verification request. Our team will review your information and get back to
          you within 2-3 business days.
        </p>
        <button
          className="px-6 py-3 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition-colors"
          onClick={() => (window.location.href = "/artisan-dashboard")}
        >
          Go to Dashboard
        </button>
      </motion.div>
    )
  }

    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6">Personal Information</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full p-3 border ${errors.fullName ? "border-red-500" : "border-gray-300"} rounded-lg bg-white text-black`}
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">ID Type</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="idType"
                    value="aadhaar"
                    checked={formData.idType === "aadhaar"}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Aadhaar Card
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="idType"
                    value="voter"
                    checked={formData.idType === "voter"}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Voter ID
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                {formData.idType === "aadhaar" ? "Aadhaar Number" : "Voter ID Number"}
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                className={`w-full p-3 border ${errors.idNumber ? "border-red-500" : "border-gray-300"} rounded-lg bg-white text-black`}
                placeholder={formData.idType === "aadhaar" ? "Enter 12-digit Aadhaar number" : "Enter Voter ID number"}
              />
              {errors.idNumber && <p className="text-red-500 text-sm mt-1">{errors.idNumber}</p>}
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6">Craft & Location</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Craft Type</label>
              <select
                name="craftType"
                value={formData.craftType}
                onChange={handleInputChange}
                className={`w-full p-3 border ${errors.craftType ? "border-red-500" : "border-gray-300"} rounded-lg bg-white text-black`}
              >
                <option value="">Select your craft</option>
                {craftTypes.map((craft) => (
                  <option key={craft} value={craft}>
                    {craft}
                  </option>
                ))}
              </select>
              {errors.craftType && <p className="text-red-500 text-sm mt-1">{errors.craftType}</p>}
            </div>

            {formData.craftType === "Other" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Specify Craft</label>
                <input
                  type="text"
                  name="otherCraftType"
                  value={formData.otherCraftType}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${errors.otherCraftType ? "border-red-500" : "border-gray-300"} rounded-lg bg-white text-black`}
                  placeholder="Please specify your craft"
                />
                {errors.otherCraftType && <p className="text-red-500 text-sm mt-1">{errors.otherCraftType}</p>}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full p-3 border ${errors.address ? "border-red-500" : "border-gray-300"} rounded-lg bg-white text-black`}
                placeholder="Enter your full address"
                rows={3}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="mb-6">
              <button
                type="button"
                onClick={getGeolocation}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                {formData.geolocation ? "Geolocation Added" : "Add Geolocation (Optional)"}
              </button>
              {formData.geolocation && (
                <p className="text-sm text-gray-500 mt-2">
                  Location added: {formData.geolocation.latitude.toFixed(6)},{" "}
                  {formData.geolocation.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6">Document Verification</h2>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">Please upload clear photos of the following documents:</p>
              <ul className="list-disc list-inside mb-4 text-sm">
                <li>Your ID proof (Aadhaar/Voter ID) - front and back</li>
                <li>A photo of yourself holding your ID</li>
                <li>Photos of your craft/work (at least 2)</li>
              </ul>

              <div
                className={`border-2 border-dashed ${errors.documents ? "border-red-500" : "border-gray-300"} rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors`}
                onClick={() => fileInputRef.current.click()}
              >
                <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600 mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG or PDF (max 5MB each)</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                  accept="image/png, image/jpeg, application/pdf"
                />
              </div>
              {errors.documents && <p className="text-red-500 text-sm mt-1">{errors.documents}</p>}
            </div>

            {formData.documents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Uploaded Documents ({formData.documents.length})</h3>
                <div className="grid grid-cols-2 gap-3">
                  {formData.documents.map((doc, index) => (
                    <div key={index} className="relative bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          {doc.type.includes("image") ? (
                            <Camera className="w-5 h-5 text-gray-500" />
                          ) : (
                            <Upload className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeDocument(index)
                          }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    All documents will be securely stored and only used for verification purposes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6">Connect Wallet & Submit</h2>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Connect your MetaMask wallet to receive your Verified Artisan NFT certificate and access the
                marketplace.
              </p>

              {!formData.walletConnected ? (
                <div>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-red-600 text-white rounded-lg hover:opacity-90 transition-colors"
                  >
                    <ConnectButton />
                  </button>
                  {errors.wallet && <p className="text-red-500 text-sm mt-1">{errors.wallet}</p>}
                </div>
              ) : (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-red-600 rounded-full flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Wallet Connected</p>
                      <p className="text-xs text-gray-500">MetaMask</p>
                    </div>
                  </div>
                  <p className="text-sm font-mono bg-gray-200 p-2 rounded break-all">{formData.walletAddress}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-700" />
                Verification Process
              </h3>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                <li>Our team will review your submitted documents</li>
                <li>We may contact you for additional information</li>
                <li>Once verified, you'll receive your Artisan NFT certificate</li>
                <li>You can then list your products on the marketplace</li>
              </ol>
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="terms"
                className="mr-2"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData((prev) => ({ ...prev, agreeTerms: e.target.checked }))}
              />
              <label htmlFor="terms" className="text-sm">
                I confirm that all information provided is accurate and I agree to the{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </label>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Artisan Verification</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Complete the verification process to become a certified artisan on CraftsChain and showcase your authentic
            crafts to the world.
          </p>
        </div>

        {renderStepIndicator()}

        <motion.div
          className="bg-white text-black rounded-xl p-6 md:p-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderStepContent()}

          {!isSubmitted && (
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div></div>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-red-600 text-white rounded-full hover:opacity-90 transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {isPending ? "Confirm in wallet..." : isConfirming ? "Confirming transaction..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      Submit Verification
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
