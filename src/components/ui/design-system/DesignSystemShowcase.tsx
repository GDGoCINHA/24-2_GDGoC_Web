'use client'

import React, { useState } from 'react'
import { GdgButton, GDG_BUTTON_SIZES, GDG_BUTTON_VARIANTS } from './GdgButton'
import { GdgCheckbox, GDG_CHECKBOX_SIZES } from './GdgCheckbox'
import {
  GdgColorTag,
  GDG_COLOR_TAG_COLORS,
  GDG_COLOR_TAG_FILLS,
  GDG_COLOR_TAG_SIZES
} from './GdgColorTag'
import { GdgDropdown, type GdgDropdownSize } from './GdgDropdown'
import {
  GdgFileCard,
  GdgUploadButton,
  GDG_FILE_CARD_ACTIONS,
  GDG_FILE_CARD_DEVICES
} from './GdgFileCard'
import { GdgInputField, GDG_INPUT_STATES } from './GdgInputField'
import { GdgFieldContainer } from './GdgFieldContainer'
import { GdgLogo, GDG_LOGO_MODES, GDG_LOGO_VARIANTS } from './GdgLogo'
import { GdgGoogleLoginButton } from './GdgGoogleLoginButton'
import { GdgMajorDropdown } from './GdgMajorDropdown'
import { GdgRadio } from './GdgRadio'
import { GdgSearchField, GDG_SEARCH_FIELD_WIDTHS } from './GdgSearchField'
import {
  GdgSegmentedButton,
  GDG_SEGMENTED_BUTTON_DEVICES,
  GDG_SEGMENTED_BUTTON_EDGES
} from './GdgSegmentedButton'
import { GdgTag, GDG_TAG_DEVICES, GDG_TAG_VARIANTS } from './GdgTag'
import { GdgTextarea, GDG_TEXTAREA_DEVICES, GDG_TEXTAREA_STATES } from './GdgTextarea'
import { GDG_MOBILE_WIDTHS, GDG_PC_NARROW_WIDTHS, GDG_PC_WIDE_WIDTHS } from './controlMeta'

const INPUT_DENSITIES = ['default', 'mini'] as const

const DROPDOWN_PC_WIDE_SIZES: GdgDropdownSize[] = ['mini', 'small', 'medium', 'full']
const DROPDOWN_MOBILE_SIZES: GdgDropdownSize[] = ['small', 'medium', 'twoThirds', 'full']

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
  const [buttonState, setButtonState] = useState<
    Record<'pc' | 'mobile', { active: boolean; clicks: number }>
  >({
    pc: { active: false, clicks: 0 },
    mobile: { active: false, clicks: 0 }
  })
  const [segmentedPressed, setSegmentedPressed] = useState<
    Record<'pc' | 'mobile', 'left' | 'right'>
  >({
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
    <div className="space-y-8 text-white pb-32">
      <h1 className="text-2xl font-semibold tracking-tight">Design System Showcase</h1>
      <Section title="Logo">
        <div className="grid gap-3 md:grid-cols-3">
          {GDG_LOGO_MODES.map((mode) =>
            GDG_LOGO_VARIANTS.map((variant) => (
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
            {GDG_SEGMENTED_BUTTON_DEVICES.map((device) => (
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
                  <p className="typo-pc-c1 mobile:typo-m-c1 text-gray-400">{`click: ${buttonState[device].clicks}`}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {GDG_SEGMENTED_BUTTON_DEVICES.map((device) =>
              GDG_BUTTON_SIZES.map((size) => (
                <div key={`${device}-${size}`} className="space-y-2">
                  <p className="mb-2 text-xs text-white/60 uppercase">{`${device} / ${size}`}</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    {GDG_BUTTON_VARIANTS.filter((v) => v !== 'white').map((variant) => (
                      <div
                        key={`${device}-${size}-${variant}`}
                        className="flex flex-col gap-1 items-center"
                      >
                        <GdgButton
                          device={device}
                          size={size}
                          variant={variant}
                          widthToken="medium"
                        >
                          {variant.toUpperCase()}
                        </GdgButton>
                        <span className="text-[10px] text-white/40">{variant}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Width Tokens (PC Narrow)
            </p>
            <div className="flex flex-wrap gap-4 items-start">
              {GDG_PC_NARROW_WIDTHS.map((width) => (
                <div key={`pc-narrow-${width}`} className="space-y-1">
                  <p className="text-[10px] text-white/40">{width}</p>
                  <GdgButton device="pc" pcVariant="narrow" widthToken={width} size="small">
                    {width}
                  </GdgButton>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Width Tokens (PC Wide)
            </p>
            <div className="flex flex-wrap gap-4 items-start">
              {GDG_PC_WIDE_WIDTHS.map((width) => (
                <div key={`pc-wide-${width}`} className="space-y-1">
                  <p className="text-[10px] text-white/40">{width}</p>
                  <GdgButton device="pc" pcVariant="wide" widthToken={width} size="small">
                    {width}
                  </GdgButton>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Width Tokens (Mobile)
            </p>
            <div className="flex flex-wrap gap-4 items-start">
              {GDG_MOBILE_WIDTHS.map((width) => (
                <div key={`mobile-width-${width}`} className="space-y-1">
                  <p className="text-[10px] text-white/40">{width}</p>
                  <GdgButton device="mobile" widthToken={width} size="small">
                    {width}
                  </GdgButton>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/5">
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Specialized: Google Login Button
            </p>
            <div className="flex flex-wrap gap-6 items-start">
              <div className="space-y-2">
                <p className="text-[10px] text-white/40">PC Style (300x52)</p>
                <GdgGoogleLoginButton device="pc" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] text-white/40">Mobile Style (260x46)</p>
                <GdgGoogleLoginButton device="mobile" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Segmented">
        <div className="grid gap-3 md:grid-cols-2">
          {GDG_SEGMENTED_BUTTON_DEVICES.map((device) => (
            <div key={device} className="space-y-2">
              <p className="text-xs text-white/60">{device}</p>
              <div className="grid grid-flow-col auto-cols-fr gap-0 w-fit">
                {GDG_SEGMENTED_BUTTON_EDGES.map((edge) => (
                  <GdgSegmentedButton
                    key={`${device}-${edge}`}
                    device={device}
                    edge={edge}
                    pressed={segmentedPressed[device] === edge}
                    onClick={() => setSegmentedPressed((prev) => ({ ...prev, [device]: edge }))}
                  >
                    {edge.charAt(0).toUpperCase() + edge.slice(1)}
                  </GdgSegmentedButton>
                ))}
              </div>
              <p className="typo-pc-c1 mobile:typo-m-c1 text-gray-400">{`selected: ${segmentedPressed[device]}`}</p>
              <div className="grid grid-flow-col auto-cols-fr gap-0 w-fit">
                {GDG_SEGMENTED_BUTTON_EDGES.map((edge) => (
                  <GdgSegmentedButton
                    key={`${device}-${edge}-disabled`}
                    device={device}
                    edge={edge}
                    disabled
                  >
                    Disabled
                  </GdgSegmentedButton>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tag">
        <div className="space-y-4">
          {GDG_TAG_DEVICES.map((device) => (
            <div key={device} className="space-y-2">
              <p className="text-xs text-white/60">{device}</p>
              <div className="flex flex-wrap gap-2">
                {GDG_TAG_VARIANTS.map((variant) => (
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
              {GDG_COLOR_TAG_COLORS.map((color) => (
                <div key={color} className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.12em] text-white/50">{color}</p>
                  <div className="space-y-2">
                    {GDG_COLOR_TAG_SIZES.map((size) => (
                      <div key={`${color}-${size}`} className="flex flex-wrap gap-2">
                        {GDG_COLOR_TAG_FILLS.map((fill) => (
                          <GdgColorTag
                            key={`${size}-${color}-${fill}`}
                            size={size}
                            color={color}
                            fill={fill}
                          >
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

      <Section title="Input Field & Container">
        <div className="space-y-8">
          <div className="space-y-4 border-b border-white/5 pb-6">
            <p className="text-xs text-white/60">Field Container States</p>
            <div className="grid gap-6 md:grid-cols-2">
              <GdgFieldContainer label="Default Field" caption="This is a caption">
                <GdgInputField placeholder="Available state" />
              </GdgFieldContainer>
              <GdgFieldContainer label="Required Field" required caption="Required asterisk shown">
                <GdgInputField placeholder="Available state" />
              </GdgFieldContainer>
              <GdgFieldContainer
                label="Success State"
                status="success"
                statusMessage="Success message appears here"
              >
                <GdgInputField placeholder="Available state" value="Correct Value" readOnly />
              </GdgFieldContainer>
              <GdgFieldContainer
                label="Error State"
                status="error"
                statusMessage="Error message appears here"
              >
                <GdgInputField state="error" placeholder="Error state" />
              </GdgFieldContainer>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-white/60">pc / narrow widths</p>
            <div className="space-y-2">
              {GDG_PC_NARROW_WIDTHS.map((width) =>
                GDG_INPUT_STATES.map((state) => (
                  <GdgInputField
                    key={`pc-narrow-${width}-${state}`}
                    device="pc"
                    pcVariant="narrow"
                    width={width}
                    state={state === 'available' ? undefined : state}
                    disabled={state === 'disabled'}
                    label={`${width}-${state}`}
                    placeholder="input"
                    defaultValue={state === 'available' ? 'value' : undefined}
                    readOnly={state !== 'available'}
                  />
                ))
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-white/60">pc / wide widths (mini 포함)</p>
            <div className="space-y-2">
              {GDG_PC_WIDE_WIDTHS.map((width) =>
                GDG_INPUT_STATES.map((state) => (
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
                    defaultValue={state === 'available' ? 'value' : undefined}
                    readOnly={state !== 'available'}
                  />
                ))
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-white/60">mobile widths</p>
            <div className="space-y-2">
              {GDG_MOBILE_WIDTHS.map((width) =>
                GDG_INPUT_STATES.map((state) => (
                  <GdgInputField
                    key={`mobile-${width}-${state}`}
                    device="mobile"
                    width={width}
                    state={state === 'available' ? undefined : state}
                    disabled={state === 'disabled'}
                    label={`${width}-${state}`}
                    placeholder="input"
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
          {GDG_TEXTAREA_DEVICES.map((device) =>
            GDG_TEXTAREA_STATES.map((state) => (
              <GdgTextarea
                key={`${device}-${state}`}
                device={device}
                state={state}
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
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-white/60">pc</p>
            {GDG_SEARCH_FIELD_WIDTHS.filter((w) => w !== 'twoThirds').map((width) => (
              <div key={`pc-${width}`} className="space-y-2">
                <p className="text-xs text-white/40">{`pc-${width}`}</p>
                <GdgSearchField device="pc" width={width} placeholder="search" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs text-white/60">mobile</p>
            {GDG_SEARCH_FIELD_WIDTHS.filter((w) => w !== 'half').map((width) => (
              <div key={`mobile-${width}`} className="space-y-2">
                <p className="text-xs text-white/40">{`mobile-${width}`}</p>
                <GdgSearchField device="mobile" width={width} placeholder="search" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs text-white/60">states</p>
            <GdgSearchField device="pc" width="half" placeholder="disabled" disabled />
          </div>
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
              <GdgDropdown
                device="mobile"
                size="full"
                label="auto-focus"
                placeholder="Auto Focus"
                options={dropdownOptions}
                autoFocus
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
          {GDG_CHECKBOX_SIZES.map((size) => (
            <div key={size} className="space-y-2">
              <p className="text-xs text-white/60">{size}</p>
              <div className="flex flex-wrap gap-3">
                <GdgCheckbox
                  size={size}
                  checked={checkboxChecked[size]}
                  onCheckedChange={(checked) =>
                    setCheckboxChecked((prev) => ({ ...prev, [size]: checked }))
                  }
                />
                <p className="typo-pc-c1 mobile:typo-m-c1 text-gray-400">
                  {checkboxChecked[size] ? 'checked' : 'unchecked'}
                </p>
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
          {GDG_FILE_CARD_DEVICES.map((device) => (
            <div key={device} className="space-y-2">
              <p className="text-xs text-white/60">{device}</p>
              <div className="grid gap-2">
                {GDG_FILE_CARD_ACTIONS.map((action) => (
                  <GdgFileCard
                    key={`${device}-${action}-icon`}
                    device={device as any}
                    fileName={`${device}-${action}.pdf`}
                    fileSize="1.2MB"
                    action={action}
                    showFileIcon
                  />
                ))}
                {GDG_FILE_CARD_ACTIONS.map((action) => (
                  <GdgFileCard
                    key={`${device}-${action}-no-icon`}
                    device={device as any}
                    fileName={`${device}-${action}-no-icon.pdf`}
                    fileSize="2.8MB"
                    action={action}
                    showFileIcon={false}
                  />
                ))}
                <GdgUploadButton device={device as any} />
                <GdgUploadButton device={device as any} disabled />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
