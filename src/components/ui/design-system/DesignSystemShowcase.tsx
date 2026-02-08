'use client'

import { useState } from 'react'
import { GdgButton } from './GdgButton'
import { GdgCheckbox } from './GdgCheckbox'
import { GdgColorTag } from './GdgColorTag'
import { GdgDropdown, type GdgDropdownSize } from './GdgDropdown'
import { GdgFileCard, GdgUploadButton } from './GdgFileCard'
import { GdgInputField } from './GdgInputField'
import { GdgLogo } from './GdgLogo'
import { GdgMajorDropdown } from './GdgMajorDropdown'
import { GdgRadio } from './GdgRadio'
import { GdgSearchField } from './GdgSearchField'
import { GdgSegmentedButton } from './GdgSegmentedButton'
import { GdgTag } from './GdgTag'
import { GdgTextarea } from './GdgTextarea'

const BUTTON_DEVICES = ['pc', 'mobile'] as const
const BUTTON_SIZES = ['large', 'small'] as const
const BUTTON_VARIANTS = ['default', 'active', 'pressed', 'disabled'] as const

const INPUT_STATES = ['available', 'error', 'disabled'] as const
const INPUT_DENSITIES = ['default', 'mini'] as const

const DROPDOWN_PC_WIDE_SIZES: GdgDropdownSize[] = ['mini', 'small', 'medium', 'full']
const DROPDOWN_MOBILE_SIZES: GdgDropdownSize[] = ['small', 'medium', 'twoThirds', 'full']

const TAG_VARIANTS = ['default', 'active', 'interactive', 'disabled'] as const
const TAG_DEVICES = ['pc', 'mobile'] as const
const COLOR_TAG_COLORS = ['red', 'blue', 'green', 'yellow', 'white'] as const
const COLOR_TAG_FILLS = ['on', 'off', 'half'] as const
const COLOR_TAG_SIZES = ['pc', 'mobile', 'mini'] as const

const FILE_CARD_ACTIONS = ['remove', 'download', 'none'] as const
const FILE_CARD_DEVICES = ['pc', 'mobile'] as const

const dropdownOptions = [
  { id: 'opt-1', label: '옵션 1' },
  { id: 'opt-2', label: '옵션 2' },
  { id: 'opt-3', label: '옵션 3' }
]

const groupedDropdownOptions = [
  {
    title: '공과대학',
    items: [
      { id: 'cse', label: '컴퓨터공학과' },
      { id: 'ai', label: '인공지능공학과' }
    ]
  },
  {
    title: '자연과학대학',
    items: [
      { id: 'math', label: '수학과' },
      { id: 'stat', label: '통계학과' }
    ]
  }
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-t border-white/15 pt-5 first:border-t-0 first:pt-0">
      <h2 className="text-sm uppercase tracking-[0.2em] text-white/70">{title}</h2>
      {children}
    </section>
  )
}

export function DesignSystemShowcase() {
  const [majorPc, setMajorPc] = useState('')
  const [majorMobile, setMajorMobile] = useState('')
  const [buttonState, setButtonState] = useState<Record<'pc' | 'mobile', { active: boolean; clicks: number }>>({
    pc: { active: false, clicks: 0 },
    mobile: { active: false, clicks: 0 }
  })
  const [segmentedPressed, setSegmentedPressed] = useState<Record<'pc' | 'mobile', 'left' | 'right'>>({
    pc: 'left',
    mobile: 'left'
  })
  const [checkboxChecked, setCheckboxChecked] = useState<Record<'pc' | 'mobile', boolean>>({
    pc: false,
    mobile: false
  })
  const [radioChecked, setRadioChecked] = useState<Record<'pc' | 'mobile', 'left' | 'right'>>({
    pc: 'left',
    mobile: 'left'
  })

  return (
    <div className="space-y-8 text-white">
      <h1 className="text-2xl font-semibold tracking-tight">Design System Showcase</h1>
      <Section title="Logo">
        <div className="grid gap-3 md:grid-cols-3">
          {(['auto', 'pc', 'mobile'] as const).map((mode) =>
            (['icon', 'short', 'long'] as const).map((variant) => (
              <div key={`${mode}-${variant}`} className="space-y-2">
                <p className="mb-2 text-xs text-white/60">{`${mode} / ${variant}`}</p>
                <GdgLogo mode={mode} variant={variant} />
              </div>
            ))
          )}
        </div>
      </Section>

      <Section title="Button">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {BUTTON_DEVICES.map((device) => (
              <div key={`interactive-${device}`} className="space-y-2">
                <p className="mb-2 text-xs text-white/60">{`${device} / interactive`}</p>
                <div className="flex items-center gap-2">
                  <GdgButton
                    device={device}
                    size="small"
                    variant={buttonState[device].active ? 'active' : 'default'}
                    onClick={() =>
                      setButtonState((prev) => ({
                        ...prev,
                        [device]: {
                          active: !prev[device].active,
                          clicks: prev[device].clicks + 1
                        }
                      }))
                    }
                  >
                    {buttonState[device].active ? 'ACTIVE' : 'DEFAULT'}
                  </GdgButton>
                  <p className="typo-c1 text-gray-600">{`click: ${buttonState[device].clicks}`}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
          {BUTTON_DEVICES.map((device) =>
            BUTTON_SIZES.map((size) =>
              BUTTON_VARIANTS.map((variant) => (
                <div key={`${device}-${size}-${variant}`} className="space-y-2">
                  <p className="mb-2 text-xs text-white/60">{`${device} / ${size} / ${variant}`}</p>
                  <GdgButton device={device} size={size} variant={variant}>
                    BUTTON
                  </GdgButton>
                </div>
              ))
            )
          )}
          </div>
        </div>
      </Section>

      <Section title="Segmented">
        <div className="grid gap-3 md:grid-cols-2">
          {BUTTON_DEVICES.map((device) => (
            <div key={device} className="space-y-2">
              <p className="text-xs text-white/60">{device}</p>
              <div className="flex gap-1">
                <GdgSegmentedButton
                  device={device}
                  edge="left"
                  pressed={segmentedPressed[device] === 'left'}
                  onClick={() => setSegmentedPressed((prev) => ({ ...prev, [device]: 'left' }))}
                >
                  Left
                </GdgSegmentedButton>
                <GdgSegmentedButton
                  device={device}
                  edge="right"
                  pressed={segmentedPressed[device] === 'right'}
                  onClick={() => setSegmentedPressed((prev) => ({ ...prev, [device]: 'right' }))}
                >
                  Right
                </GdgSegmentedButton>
              </div>
              <p className="typo-c1 text-gray-600">{`selected: ${segmentedPressed[device]}`}</p>
              <div className="flex gap-1">
                <GdgSegmentedButton device={device} edge="left" disabled>
                  Disabled
                </GdgSegmentedButton>
                <GdgSegmentedButton device={device} edge="right" disabled>
                  Disabled
                </GdgSegmentedButton>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tag">
        <div className="space-y-4">
          {TAG_DEVICES.map((device) => (
            <div key={device} className="space-y-2">
              <p className="text-xs text-white/60">{device}</p>
              <div className="flex flex-wrap gap-2">
                {TAG_VARIANTS.map((variant) => (
                  <GdgTag key={`${device}-${variant}`} device={device} variant={variant}>
                    {variant}
                  </GdgTag>
                ))}
              </div>
            </div>
          ))}
          <div className="space-y-3">
            <p className="text-xs text-white/60">color tag</p>
            <div className="space-y-4">
              {COLOR_TAG_COLORS.map((color) => (
                <div key={color} className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.12em] text-white/50">{color}</p>
                  <div className="space-y-2">
                    {COLOR_TAG_SIZES.map((size) => (
                      <div key={`${color}-${size}`} className="flex flex-wrap gap-2">
                        {COLOR_TAG_FILLS.map((fill) => (
                          <GdgColorTag key={`${size}-${color}-${fill}`} size={size} color={color} fill={fill}>
                            {`${size}-${fill}`}
                          </GdgColorTag>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Input Field">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-white/60">pc / narrow</p>
            <div className="space-y-2">
              {(['small', 'medium', 'twoThirds', 'full'] as const).map((width) =>
                INPUT_STATES.map((state) => (
                  <GdgInputField
                    key={`pc-narrow-${width}-${state}`}
                    device="pc"
                    pcVariant="narrow"
                    width={width}
                    state={state === 'available' ? undefined : state}
                    disabled={state === 'disabled'}
                    label={`${width}-${state}`}
                    placeholder="input"
                    helperText="helper"
                    errorText="error"
                    defaultValue={state === 'available' ? 'value' : undefined}
                    readOnly={state !== 'available'}
                  />
                ))
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-white/60">pc / wide (mini 포함)</p>
            <div className="space-y-2">
              {(['mini', 'small', 'quarter', 'medium', 'full'] as const).map((width) =>
                INPUT_STATES.map((state) => (
                  <GdgInputField
                    key={`pc-wide-${width}-${state}`}
                    device="pc"
                    pcVariant="wide"
                    width={width}
                    density={width === 'mini' ? INPUT_DENSITIES[1] : INPUT_DENSITIES[0]}
                    state={state === 'available' ? undefined : state}
                    disabled={state === 'disabled'}
                    label={`${width}-${state}`}
                    placeholder="input"
                    helperText="helper"
                    errorText="error"
                    defaultValue={state === 'available' ? 'value' : undefined}
                    readOnly={state !== 'available'}
                  />
                ))
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-white/60">mobile</p>
            <div className="space-y-2">
              {(['small', 'medium', 'twoThirds', 'full'] as const).map((width) =>
                INPUT_STATES.map((state) => (
                  <GdgInputField
                    key={`mobile-${width}-${state}`}
                    device="mobile"
                    width={width}
                    state={state === 'available' ? undefined : state}
                    disabled={state === 'disabled'}
                    label={`${width}-${state}`}
                    placeholder="input"
                    helperText="helper"
                    errorText="error"
                    defaultValue={state === 'available' ? 'value' : undefined}
                    readOnly={state !== 'available'}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Textarea">
        <div className="space-y-2">
          {(['pc', 'mobile'] as const).map((device) =>
            (['default', 'error', 'disabled'] as const).map((state) => (
              <GdgTextarea
                key={`${device}-${state}`}
                device={device}
                state={state === 'disabled' ? 'default' : state}
                disabled={state === 'disabled'}
                label={`${device}-${state}`}
                helperText="helper"
                errorText="error"
                placeholder="textarea"
              />
            ))
          )}
        </div>
      </Section>

      <Section title="Search Field">
        <div className="space-y-2">
          {(['pc', 'mobile'] as const).map((device) =>
            (['full', 'quarter'] as const).map((width) => (
              <div key={`${device}-${width}`} className="space-y-2">
                <p className="text-xs text-white/60">{`${device}-${width}`}</p>
                <GdgSearchField device={device} width={width} placeholder="search" />
                <GdgSearchField device={device} width={width} placeholder="disabled" disabled />
              </div>
            ))
          )}
        </div>
      </Section>

      <Section title="Dropdown">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-white/60">pc / wide</p>
            <div className="space-y-2">
              {DROPDOWN_PC_WIDE_SIZES.map((size) => (
                <GdgDropdown
                  key={`pc-wide-${size}`}
                  device="pc"
                  pcVariant="wide"
                  size={size}
                  label={`pc-wide-${size}`}
                  placeholder="dropdown"
                  options={dropdownOptions}
                  helperText="helper"
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-white/60">mobile</p>
            <div className="space-y-2">
              {DROPDOWN_MOBILE_SIZES.map((size) => (
                <GdgDropdown
                  key={`mobile-${size}`}
                  device="mobile"
                  size={size}
                  label={`mobile-${size}`}
                  placeholder="dropdown"
                  options={dropdownOptions}
                  helperText="helper"
                />
              ))}
              <GdgDropdown
                device="mobile"
                size="full"
                label="mobile-grouped"
                placeholder="grouped"
                optionGroups={groupedDropdownOptions}
              />
              <GdgDropdown
                device="mobile"
                size="full"
                label="mobile-disabled"
                placeholder="disabled"
                options={dropdownOptions}
                disabled
              />
              <GdgDropdown
                device="mobile"
                size="full"
                label="mobile-error"
                placeholder="error"
                options={dropdownOptions}
                isInvalid
                errorMessage="error"
              />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <GdgMajorDropdown device="pc" value={majorPc} onChangeAction={setMajorPc} />
            <GdgMajorDropdown device="mobile" value={majorMobile} onChangeAction={setMajorMobile} />
          </div>
        </div>
      </Section>

      <Section title="Checkbox & Radio">
        <div className="grid gap-3 md:grid-cols-2">
          {(['pc', 'mobile'] as const).map((size) => (
            <div key={size} className="space-y-2">
              <p className="text-xs text-white/60">{size}</p>
              <div className="flex flex-wrap gap-3">
                <GdgCheckbox
                  size={size}
                  checked={checkboxChecked[size]}
                  onCheckedChange={(checked) => setCheckboxChecked((prev) => ({ ...prev, [size]: checked }))}
                />
                <p className="typo-c1 text-gray-600">{checkboxChecked[size] ? 'checked' : 'unchecked'}</p>
                <GdgCheckbox size={size} checked={false} disabled />
                <GdgCheckbox size={size} checked disabled />
              </div>
              <div className="flex flex-wrap gap-3">
                <GdgRadio
                  size={size}
                  checked={radioChecked[size] === 'left'}
                  onCheckedChange={() => setRadioChecked((prev) => ({ ...prev, [size]: 'left' }))}
                />
                <GdgRadio
                  size={size}
                  checked={radioChecked[size] === 'right'}
                  onCheckedChange={() => setRadioChecked((prev) => ({ ...prev, [size]: 'right' }))}
                />
                <GdgRadio size={size} checked={false} disabled />
                <GdgRadio size={size} checked disabled />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="File">
        <div className="space-y-3">
          {FILE_CARD_DEVICES.map((device) => (
            <div key={device} className="space-y-2">
              <p className="text-xs text-white/60">{device}</p>
              <div className="grid gap-2">
                {FILE_CARD_ACTIONS.map((action) => (
                  <GdgFileCard
                    key={`${device}-${action}-icon`}
                    device={device}
                    fileName={`${device}-${action}.pdf`}
                    fileSize="1.2MB"
                    action={action}
                    showFileIcon
                  />
                ))}
                {FILE_CARD_ACTIONS.map((action) => (
                  <GdgFileCard
                    key={`${device}-${action}-no-icon`}
                    device={device}
                    fileName={`${device}-${action}-no-icon.pdf`}
                    fileSize="2.8MB"
                    action={action}
                    showFileIcon={false}
                  />
                ))}
                <GdgUploadButton device={device} />
                <GdgUploadButton device={device} disabled />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
