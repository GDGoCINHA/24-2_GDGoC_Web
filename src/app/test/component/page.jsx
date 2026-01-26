'use client'

import { useState } from 'react'
import Button from '@/components/ui/button/Button'
import Tag from '@/components/ui/Tag/Tag'
import Checkbox from '@/components/ui/Checkbox/Checkbox'
import AgreementBox from '@/components/ui/AgreementBox/AgreementBox'
import Input from '@/components/ui/input/Input'
import Textarea from '@/components/ui/textarea/Textarea'

export default function ComponentTestPage() {
  const [checkboxState, setCheckboxState] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')
  const [agreementStates, setAgreementStates] = useState({ pc: false, mobile: false })
  const [errorStates, setErrorStates] = useState({ pc: false, mobile: false })
  const [deviceMode, setDeviceMode] = useState('pc')
  const [disabledMode, setDisabledMode] = useState(false)

  return (
    <main className="min-h-screen bg-black p-8 relative">
      {/* Floating control panel */}
      <div className="fixed bottom-6 right-6 z-10 flex flex-col gap-3">
        <Button size="small" onClick={() => setDisabledMode((v) => !v)}>
          {disabledMode ? 'Enable' : 'Disable'}
        </Button>
        <Button size="small" onClick={() => setDeviceMode((d) => (d === 'pc' ? 'mobile' : 'pc'))}>
          {deviceMode === 'pc' ? 'Switch to Mobile' : 'Switch to PC'}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto text-white">
        <h1 className="text-4xl font-bold mb-12">Component Test</h1>

        {/* Button Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Button Component</h2>

          {['small', 'large'].map((size) => (
            <div className="mb-8" key={size}>
              <h3 className="text-lg font-semibold mb-4">
                {size === 'small' ? 'Small' : 'Large'} Size
              </h3>
              <div className="flex gap-4 flex-wrap">
                <Button size={size} disabled={disabledMode}>
                  {disabledMode ? 'Disabled' : 'Normal'}
                </Button>
                <Button
                  size={size}
                  disabled={disabledMode}
                  onClick={() => alert(`${size} button clicked!`)}
                >
                  {disabledMode ? 'Disabled' : 'Click Me'}
                </Button>
              </div>
            </div>
          ))}
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

          <div className="flex flex-col gap-6 mb-8">
            <div>
              <p className="text-sm text-gray-500 mb-2">Unchecked State</p>
              <AgreementBox
                device={deviceMode}
                checked={agreementStates[deviceMode]}
                onChange={(checked) =>
                  setAgreementStates({ ...agreementStates, [deviceMode]: checked })
                }
                label="동의합니다."
              />
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Checked State</p>
              <AgreementBox device={deviceMode} checked onChange={() => {}} label="동의합니다." />
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Error State</p>
              <AgreementBox
                device={deviceMode}
                status={errorStates[deviceMode] ? 'error' : 'unchecked'}
                checked={agreementStates[deviceMode]}
                onChange={(checked) =>
                  setAgreementStates({ ...agreementStates, [deviceMode]: checked })
                }
                label="동의합니다."
                errorMessage="*오류메세지"
              />
              <div className="mt-2 flex gap-3">
                <Button
                  size="small"
                  onClick={() => setErrorStates({ ...errorStates, [deviceMode]: true })}
                >
                  Show Error
                </Button>
                <Button
                  size="small"
                  onClick={() => setErrorStates({ ...errorStates, [deviceMode]: false })}
                >
                  Clear Error
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Input Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Input Component</h2>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{deviceMode.toUpperCase()} Device</h3>
            <div className="space-y-6">
              {['mini', 'small', 'medium', '2/3', 'full'].map((size) => (
                <div key={size}>
                  <p className="text-sm text-gray-500 mb-2">{size} Size</p>
                  <Input
                    device={deviceMode}
                    size={size}
                    placeholder={size}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    status={disabledMode ? 'default' : 'active'}
                    disabled={disabledMode}
                  />
                </div>
              ))}

              <div>
                <p className="text-sm text-gray-500 mb-2">Error State</p>
                <Input
                  device={deviceMode}
                  size="medium"
                  status="error"
                  placeholder="Error input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={disabledMode}
                  error="필수 입력 사항입니다."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Textarea Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Textarea Component</h2>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{deviceMode.toUpperCase()} Device</h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Active State</p>
                <Textarea
                  device={deviceMode}
                  status={disabledMode ? 'default' : 'active'}
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  disabled={disabledMode}
                />
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Error State</p>
                <Textarea
                  device={deviceMode}
                  status="error"
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  disabled={disabledMode}
                  errorMessage="※ 필수 입력 사항입니다."
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
