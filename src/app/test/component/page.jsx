'use client'

import { useState } from 'react'
import Button from '@/components/ui/button/Button'
import Tag from '@/components/ui/Tag/Tag'
import Checkbox from '@/components/ui/Checkbox/Checkbox'
import AgreementBox from '@/components/ui/AgreementBox/AgreementBox'

export default function ComponentTestPage() {
  const [checkboxState, setCheckboxState] = useState(false)
  const [agreementStates, setAgreementStates] = useState({
    pc_unchecked: false,
    pc_checked: true,
    pc_error: false,
    mobile_unchecked: false,
    mobile_checked: true,
    mobile_error: false
  })
  const [pcError, setPcError] = useState(false)
  const [mobileError, setMobileError] = useState(false)

  return (
    <main className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto text-white">
        <h1 className="text-4xl font-bold mb-12">Component Test</h1>

        {/* Button Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Button Component</h2>

          {/* Small Size */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Small Size</h3>
            <div className="flex gap-4 flex-wrap">
              <Button size="small">Normal</Button>
              <Button size="small" disabled>
                Disabled
              </Button>
            </div>
          </div>

          {/* Large Size */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Large Size</h3>
            <div className="flex gap-4 flex-wrap">
              <Button size="large">Normal</Button>
              <Button size="large" disabled>
                Disabled
              </Button>
            </div>
          </div>

          {/* With onClick */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Interactive</h3>
            <div className="flex gap-4 flex-wrap">
              <Button size="small" onClick={() => alert('Button clicked!')}>
                Click Me
              </Button>
              <Button size="large" onClick={() => alert('Large button clicked!')}>
                Click Large Button
              </Button>
            </div>
          </div>
        </section>

        {/* Tag Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Tag Component</h2>

          {/* Fill Variant */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Fill Variant</h3>
            <div className="flex gap-3 flex-wrap">
              <Tag label="Red" color="red" variant="fill" size="default" />
              <Tag label="Blue" color="blue" variant="fill" size="default" />
              <Tag label="Green" color="green" variant="fill" size="default" />
              <Tag label="Yellow" color="yellow" variant="fill" size="default" />
            </div>
          </div>

          {/* Outline Variant */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Outline Variant</h3>
            <div className="flex gap-3 flex-wrap">
              <Tag label="Red" color="red" variant="outline" size="default" />
              <Tag label="Blue" color="blue" variant="outline" size="default" />
              <Tag label="Green" color="green" variant="outline" size="default" />
              <Tag label="Yellow" color="yellow" variant="outline" size="default" />
            </div>
          </div>

          {/* Glass Variant */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Glass Variant</h3>
            <div className="flex gap-3 flex-wrap">
              <Tag label="Red" color="red" variant="glass" size="default" />
              <Tag label="Blue" color="blue" variant="glass" size="default" />
              <Tag label="Green" color="green" variant="glass" size="default" />
              <Tag label="Yellow" color="yellow" variant="glass" size="default" />
            </div>
          </div>

          {/* Mini Size */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Mini Size</h3>
            <div className="flex gap-3 flex-wrap">
              <Tag label="Red" color="red" variant="fill" size="mini" />
              <Tag label="Blue" color="blue" variant="fill" size="mini" />
              <Tag label="Green" color="green" variant="fill" size="mini" />
              <Tag label="Yellow" color="yellow" variant="fill" size="mini" />
            </div>
          </div>
        </section>

        {/* Checkbox Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Checkbox Component</h2>

          {/* Basic Checkbox */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Basic</h3>
            <div className="flex gap-4 flex-wrap">
              <Checkbox checked={checkboxState} onChange={setCheckboxState} />
              <span className="text-gray-700">Click checkbox to toggle</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Checked: {checkboxState ? 'Yes' : 'No'}</p>
          </div>
        </section>

        {/* Agreement Box Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Agreement Box Component</h2>

          {/* PC Device */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">PC Device</h3>
            <div className="flex flex-col gap-6">
              {/* Unchecked */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Unchecked State</p>
                <AgreementBox
                  device="pc"
                  checked={agreementStates.pc_unchecked}
                  onChange={(checked) =>
                    setAgreementStates({ ...agreementStates, pc_unchecked: checked })
                  }
                  label="동의합니다."
                />
              </div>

              {/* Checked */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Checked State</p>
                <AgreementBox
                  device="pc"
                  checked={agreementStates.pc_checked}
                  onChange={(checked) =>
                    setAgreementStates({ ...agreementStates, pc_checked: checked })
                  }
                  label="동의합니다."
                />
              </div>

              {/* Error State */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Error State</p>
                <AgreementBox
                  device="pc"
                  status={pcError ? 'error' : 'unchecked'}
                  checked={agreementStates.pc_error}
                  onChange={(checked) =>
                    setAgreementStates({ ...agreementStates, pc_error: checked })
                  }
                  label="동의합니다."
                  errorMessage="*오류메세지"
                />
                <div className="mt-2 flex gap-3">
                  <Button size="small" onClick={() => setPcError(true)}>
                    Show Error
                  </Button>
                  <Button size="small" onClick={() => setPcError(false)}>
                    Clear Error
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Device */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Mobile Device</h3>
            <div className="flex flex-col gap-6">
              {/* Unchecked */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Unchecked State</p>
                <AgreementBox
                  device="mobile"
                  checked={agreementStates.mobile_unchecked}
                  onChange={(checked) =>
                    setAgreementStates({ ...agreementStates, mobile_unchecked: checked })
                  }
                  label="동의합니다."
                />
              </div>

              {/* Checked */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Checked State</p>
                <AgreementBox
                  device="mobile"
                  checked={agreementStates.mobile_checked}
                  onChange={(checked) =>
                    setAgreementStates({ ...agreementStates, mobile_checked: checked })
                  }
                  label="동의합니다."
                />
              </div>

              {/* Error State */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Error State</p>
                <AgreementBox
                  device="mobile"
                  status={mobileError ? 'error' : 'unchecked'}
                  checked={agreementStates.mobile_error}
                  onChange={(checked) =>
                    setAgreementStates({ ...agreementStates, mobile_error: checked })
                  }
                  label="동의합니다."
                  errorMessage="*오류메세지"
                />
                <div className="mt-2 flex gap-3">
                  <Button size="small" onClick={() => setMobileError(true)}>
                    Show Error
                  </Button>
                  <Button size="small" onClick={() => setMobileError(false)}>
                    Clear Error
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
