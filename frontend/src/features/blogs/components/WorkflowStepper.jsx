import React from 'react'

const TEAM_STAGES = [
  { step: 1, name: 'Stage 1: Details', subtitle: 'Title & Taxonomy' },
  { step: 2, name: 'Stage 2: Assignment', subtitle: 'Writer • Reviewer' },
  { step: 3, name: 'Stage 3: Workspace', subtitle: 'Editing & AI Co-pilot' },
  { step: 4, name: 'Stage 4: Review', subtitle: 'Quality Gates' },
  { step: 5, name: 'Stage 5: Publishing', subtitle: 'Pre-flight & SEO' },
  { step: 6, name: 'Stage 6: Published', subtitle: 'Live & Dev.to' },
]

const INDIVIDUAL_STAGES = [
  { step: 1, name: 'Stage 1: Details', subtitle: 'Title & Taxonomy' },
  { step: 2, name: 'Stage 2: Workspace', subtitle: 'Editing & AI Co-pilot' },
  { step: 3, name: 'Stage 3: Review', subtitle: 'Self-Review & Check' },
  { step: 4, name: 'Stage 4: Publishing', subtitle: 'Pre-flight & SEO' },
  { step: 5, name: 'Stage 5: Published', subtitle: 'Live & Dev.to' },
]

const WorkflowStepper = ({ currentStep = 1, isTeam = false, onStepClick }) => {
  const stages = isTeam ? TEAM_STAGES : INDIVIDUAL_STAGES

  return (
    <nav aria-label="Editorial Workflow Stepper" className="v2-wf-stepper-container">
      <div className="v2-wf-stepper-grid">
        {stages.map((item) => {
          const isActive = currentStep === item.step
          const isDone = currentStep > item.step
          const isClickable = Boolean(onStepClick) && item.step < currentStep

          return (
            <div
              key={item.step}
              onClick={() => isClickable && onStepClick(item.step)}
              className={`v2-wf-step-card ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''} ${
                isClickable ? 'is-clickable' : ''
              }`}
            >
              <div className="v2-wf-step-badge">
                {isDone ? (
                  <span className="v2-wf-check-icon">✓</span>
                ) : (
                  <span>{item.step}</span>
                )}
              </div>
              <div className="v2-wf-step-text">
                <div className="v2-wf-step-name-row">
                  <span className="v2-wf-step-name">{item.name}</span>
                  {isActive && <span className="v2-wf-active-dot" />}
                </div>
                <span className="v2-wf-step-subtitle">{item.subtitle}</span>
              </div>
            </div>
          )
        })}
      </div>
    </nav>
  )
}

export default WorkflowStepper
