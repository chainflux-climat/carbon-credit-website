# VMR0017 explained: eligibility, additionality, baseline and monitoring

> VMR0017 Grid-Connected Electricity Generation from Renewable Sources (ACM0002 Revision) is a Verra methodology revision, version 1.0 of 23 April 2026. It cannot be used on its own: the procedures of CDM methodology ACM0002, v22.0, apply except where VMR0017 replaces them. It sets eligibility through a technology, capacity and geography table, replaces four CDM tools with VCS tools, adds project emissions from battery fire suppression agents, and treats the plant's embodied emissions as leakage.

Updated 2026-09-30. Canonical: https://climat.today/methodologies/vmr0017/

- **Code:** VMR0017, a revision of CDM methodology ACM0002
- **Current version:** 1.0, issued 23 April 2026
- **Sectoral scope:** 1, Energy supply
- **Applied with:** ACM0002, v22.0 — VMR0017 is not a standalone methodology
- **Approach:** Project method for both additionality and the crediting baseline; reductions, not removals
- **Additionality:** VT0008 — regulatory surplus, investment analysis, common practice; barrier analysis not applicable
- **Last checked:** 30 September 2026

## What does VMR0017 cover, and how does it relate to ACM0002?

VMR0017 is a *methodology revision*, not a methodology. Verra developed version 1.0, issued 23 April 2026, on top of the Clean Development Mechanism methodology [ACM0002 Grid-connected Electricity Generation from Renewable Sources, v22.0](https://verra.org/documents/vmr0017-grid-connected-electricity-generation-from-renewable-sources/), and states plainly that it must be used with ACM0002, v22.0. The procedures and requirements of ACM0002 apply unless VMR0017 says otherwise (Section 2). Everything below is what VMR0017 adds or replaces; the rest of a project's quantification still comes out of ACM0002.

The revision does five things. It widens geographic eligibility through a new table of technologies, capacities and geographies. It replaces four CDM tools with VCS tools. It adds provisions for battery energy storage systems, both for grid charging and for the release of fire suppression agents. It makes the power plant's embodied emissions a leakage term, where ACM0002 largely had none. And it removes the simplified additionality procedure that relied on a CDM positive-list tool.

Its summary table sets the three things a Verra methodology has to declare: additionality is established by a **project method**, the crediting baseline is a **project method**, and the mitigation outcome is **reductions** — not removals. A project under VMR0017 therefore argues its own case rather than being deemed additional by a positive list, and it generates avoided emissions rather than carbon removals.

## Which projects are eligible?

All applicability conditions in Section 2.2 of ACM0002 have to be met, with replacements. The important one is condition 8(a), which VMR0017 rewrites so that a project activity must correspond to one or more rows of its own Table 1. That table is the heart of the revision, because it is where geography enters.

| Technology | Capacity | Geographies |
| --- | --- | --- |
| Wind (onshore and offshore), geothermal, terrestrial solar PV | Any | Low-, lower-middle- and upper-middle-income countries only, by World Bank country and lending group |
| Floating solar, wave, tidal | Any | Globally applicable |
| Hydroelectric | 15 MW or less, taken as the higher of the rated capacity and the authorized capacity named in the activity approval from the regulator or government | Least developed countries only, by the UN list |

Two notes attached to the table matter as much as the table. Projects and instances already registered under ACM0002 or AMS-I.D. Grid-connected Renewable Electricity Generation keep their original maximum crediting period, but every *new* project activity instance has to correspond to a row above. And this applicability condition supersedes the default eligibility for project activities given in the VCS Standard — so a technology that the VCS Standard would otherwise admit is still out of scope here if Table 1 does not list it.

VMR0017 also adds condition 8(f) for projects that integrate a battery. The battery and the power plant must be on the same site, directly connected to each other, and share a common grid connection — VMR0017's footnote defines that as feeding into or drawing from the grid through a single grid connection or metering point. Both facilities must be owned and operated by the same entity and be part of the same investment decision. Finally, replaced condition 14 pulls in the applicability conditions of every tool the revision calls on, so VT0008 and VT0011 each add their own gate.

Because eligibility turns on a country's World Bank income classification and the UN list of least developed countries, it can change over a project's life. Both lists are revised periodically, and Table 1 points at the live lists rather than a snapshot.

## Which CDM tools does VMR0017 replace?

Section 2 makes four substitutions that a developer has to carry through every reference in ACM0002:

| CDM tool in ACM0002 | VCS tool to use instead |
| --- | --- |
| TOOL01 Tool for the Demonstration and Assessment of Additionality | [VT0008 Additionality Assessment](https://verra.org/documents/vt0008-additionality-assessment-v1-0/) |
| TOOL02 Combined Tool to Identify the Baseline Scenario and Demonstrate Additionality | VT0009 Combined Baseline and Additionality Assessment |
| TOOL05 Baseline, Project and/or Leakage Emissions from Electricity Consumption and Monitoring of Electricity Generation | VT0010 Emissions from Electricity Consumption and Generation |
| TOOL07 Tool to Calculate the Emission Factor for an Electricity System | [VT0011 Electricity System Emission Factors](https://verra.org/documents/vt0011-electricity-system-emission-factors-v1-0/) |

A fifth tool is simply gone. VMR0017 records that CDM TOOL32 Positive Lists of Technologies was inactivated under the VCS Program on 1 October 2025 and is not eligible under the revision. That is why Section 7 deletes ACM0002's paragraph 35, the simplified procedure to demonstrate additionality: there is no positive list to fall back on.

## How is additionality demonstrated?

VMR0017 replaces ACM0002's additionality paragraph with a three-step demonstration built on VT0008:

1. **Regulatory surplus**, in accordance with the applicable version of the VCS Standard. Under [VCS Program Definitions, v5.0](https://verra.org/documents/vcs-program-definitions-v5-0/), that means the activity is not mandated by any law or regulatory framework in a high-income country, and not mandated by a systematically enforced one elsewhere.

2. **Investment analysis**, following Step 3 of VT0008. Where the project applies benchmark analysis, the project documents must record whether the demonstration followed Sections 5.4.2(2)(b) and (c) of VT0008.

3. **Common practice**, following Step 4 of VT0008.

A note then removes an option that grid renewable projects have historically leaned on: barrier analysis, Step 2 of VT0008, is not applicable under VMR0017. The financial case has to carry the argument. Our [guide to additionality](https://climat.today/guides/additionality/) sets out what Step 3 and Step 4 of VT0008 each ask for, including the factor-F threshold that decides common practice.

## How is the baseline scenario identified?

For a greenfield plant, ACM0002's baseline is unchanged: the electricity the project supplies would otherwise have come from the grid, and the grid's emission factor does the work. VMR0017 rewrites the baseline procedure only for *retrofit, rehabilitation or replacement of an existing power plant*, where the counterfactual is genuinely contested.

There, Step 1 applies Step 1 of VT0009 and the alternatives must include three named scenarios: P1, the project activity undertaken without registration under a GHG program; P2, continuation of the current situation, using the equipment already in use with business-as-usual maintenance, with the extra power coming from existing and new grid-connected plants; and P3, all other plausible, technically feasible alternatives that increase generation at the site, including different levels of replacement, retrofit or rehabilitation, limited to alternatives actually available to the proponent.

Step 3 then routes the investment analysis by which scenarios survive: an investment comparison analysis under Step 3 of VT0009 where more than one alternative remains and those include P1 and P3, or a benchmark analysis under Step 3 (Option 2) of VT0008 where the remaining alternatives include P1 and P2.

## How are reductions quantified?

Net reductions follow the familiar form, with leakage no longer optional:

`ER(y) = BE(y) - PE(y) - LE(y)`

Baseline emissions are unchanged from ACM0002 — generation supplied to the grid multiplied by the combined margin grid emission factor, which under the revision is calculated with VT0011 rather than TOOL07. VT0011 sets the operating margin, build margin and combined margin procedures, and VMR0017 lets the proponent select the ex-ante or the ex-post option for the combined margin, provided the project documents record which was used, referencing paragraph 72(b) of VT0011 and paragraph 42(b) of TOOL07.

Project emissions are usually zero for renewable generation, but VMR0017 expands the equation to six terms: fossil fuel consumption, geothermal plant operation, hydropower and pumped-storage reservoirs, charging a battery from the grid or from fossil generators, grid electricity used for pumped-storage pumping beyond the paired renewable plant's output, and the release of fire suppression agents. The reservoir default emission factor is fixed at 100 kg CO 2 e/MWh, sourced from the Hydropower Sustainability Standard and its guidelines on good international industry practice.

### Battery fire suppression agents

This is new. VMR0017 states that projects should use low- or zero-GWP agents such as Novec 1230, where "low" means a global warming potential below 1. Where an agent with a GWP above 1 is used — HFC-227ea is the example given — the emissions are the mass released in each event multiplied by the agent's 100-year GWP. The GWP comes from the IPCC AR5 values as published by the GHG Protocol; for commercial blends it comes from manufacturer specifications, or a weighted average of the constituents, and where an agent is not listed, from a national or international regulatory authority such as the US EPA, or failing that from peer-reviewed literature.

### Embodied emissions as leakage

VMR0017 replaces ACM0002's Section 5.6 outright. Leakage is the life-cycle emissions of the plant — construction, operation and decommissioning, dominated in the literature by transport of equipment, people and expendables to the site and to upstream manufacturing — annualised by net generation. For a greenfield plant, leakage is net generation supplied to the grid multiplied by a technology emission factor; for a capacity addition, the generation added under the project activity is used instead.

| Renewable generation technology | Embodied emission factor (g CO 2 e/kWh) |
| --- | --- |
| Solar photovoltaic | 43 |
| Wind (onshore and offshore) | 13 |
| Biomass | 52 |
| Geothermal | 37 |
| Hydropower | 21 |
| Ocean energy | 8 |
| Concentrating solar power (tower and trough) | 28 |

The values come from NREL's *Life Cycle Greenhouse Gas Emissions from Electricity Generation: Update* of September 2021. For a technology not in the table, the proponent may take a value from credible and reputable sources or literature, but must justify the choice and document its source in the project documents.

## What must be monitored, and how often?

The parameter that drives everything is net electricity supplied to the grid — `EG(facility,y)` for the plant, or `EG(PJ_Add,y)` for generation added under the project. VMR0017 requires **direct measurement** with electricity meters installed at the grid interface for export, monitored continuously and aggregated at least monthly.

The QA/QC requirements are specific. Meters are tested and calibrated per utility or national requirements and manufacturer specifications, and cross-checked against utility or supplier receipts and invoices where applicable. Uncertainty is propagated per ACM0002 and VMR0017: for direct measurement, the actual metering uncertainty from the last calibration event, or the manufacturer's figure where no previous calibration exists; for estimates, zero where the estimate is conservative and a project-specific uncertainty where it is statistically significant. Cumulative meters are read as the difference between initial and final readings with both dates recorded, and linear interpolation is used where reading dates do not line up with the monitoring period. Where historical data feed the baseline, the proponent uses at least three years of the most recent records, or justifies why older data or a shorter period is more appropriate.

There is a narrow escape hatch: where direct measurement is temporarily not feasible for technical or logistical reasons — no access to monitoring equipment, maintenance, a remote or hazardous location — estimation methods in line with VT0010 may be used, with a justification, a demonstration that the constraint is temporary, and a demonstration that the estimation method is conservative.

Two further parameters are monitored where they apply: the mass of fire suppression agent released per event, and the electricity drawn from the grid by a battery or a pumped-storage plant, both handled through VT0010.

## Where the evidence has to be strongest

These are the places where VMR0017's own text, rather than any general practice, puts the burden on the developer — and where the [Validation and Verification Manual, v3.2](https://verra.org/documents/validation-and-verification-manual-v3-2/), requires the validation and verification body to test the evidence rather than accept the assertion:

- **The Table 1 row.** Eligibility is not "renewable energy"; it is a technology, a capacity and a geography in combination. A hydro project has to evidence both the LDC listing and the higher of rated and authorized capacity, with the activity approval on file.

- **The investment analysis.** With barrier analysis removed, Step 3 of VT0008 is the whole additionality case, and a benchmark analysis carries an explicit documentation requirement about how it was performed.

- **Common practice.** Step 4 of VT0008 needs a defensible population of similar projects and a reasoned account of which distinctions are essential.

- **The grid emission factor.** VT0011 offers several operating-margin methods and an ex-ante or ex-post combined margin; the choice has to be recorded and the data behind it has to be traceable.

- **Battery integration.** Condition 8(f) is five separate facts — same site, direct connection, common grid connection, same owner and operator, same investment decision — and each needs a document behind it.

- **Metering.** Calibration records and the uncertainty figure drawn from them, not just the meter readings.

## How Climat handles this

Climat seeds VMR0017's inputs as a methodology in the same way as VM0047, so the intake asks for the technology type, the installed capacity, the host country, whether the plant is grid connected, whether a battery is integrated and which grid emission factor option is being used. The rule-based applicability pass returns pass, fail or needs review against each condition, and the matrix conditions — the Table 1 combination, and condition 8(f) — return *needs review* rather than a verdict, because they are judgments a person has to make on documents. The evidence gap report then lists what is still unproven, most serious first, before drafting starts, and drafted sections carry citations to the intake data, to excerpts of the evidence supplied, or to the methodology. Climat does not validate a project and is not a registry.

## Frequently asked questions

### Can a hydropower project use VMR0017?

Only in a least developed country, and only at 15 MW or less. Table 1 of the revised applicability condition lists hydroelectric for LDCs alone, with capacity taken as the higher of the rated capacity and the authorized capacity named in the activity approval. Wind, geothermal and terrestrial solar PV are eligible at any capacity but only in low-, lower-middle- and upper-middle-income countries. Floating solar, wave and tidal are globally applicable at any capacity.

### Do I have to demonstrate a barrier under VMR0017?

No. VMR0017 states that barrier analysis, Step 2 of VT0008, is not applicable. Additionality is three steps: regulatory surplus under the applicable version of the VCS Standard, an investment analysis under Step 3 of VT0008, and a common practice assessment under Step 4. A project applying benchmark analysis must also record in the project documents whether the demonstration followed Sections 5.4.2(2)(b) and (c) of VT0008.

### Is leakage zero for a grid-connected renewable energy project?

Not under VMR0017. It replaces ACM0002's leakage section with the plant's embodied emissions — construction, operation and decommissioning, parameterised on net generation supplied to the grid. Leakage is net generation in the year multiplied by a technology default emission factor from NREL's life-cycle update: 43 g CO2e/kWh for solar photovoltaic, 13 for wind, 21 for hydropower, 37 for geothermal, 52 for biomass, 28 for concentrating solar power and 8 for ocean energy.

### What does VMR0017 require of a project that includes battery storage?

Added applicability condition 8(f) requires the battery energy storage system and the power plant to be on the same site, directly connected to each other, sharing a common grid connection, owned and operated by the same entity and part of the same investment decision. Charging the battery from the grid or from fossil generators is a project emission, calculated under Scenario A of VT0010. Where a fire suppression agent with a global warming potential above 1 is used, the mass released multiplied by the agent's GWP is also a project emission.

### Which CDM tools does VMR0017 replace?

Four. TOOL01 is replaced by VT0008 Additionality Assessment, TOOL02 by VT0009 Combined Baseline and Additionality Assessment, TOOL05 by VT0010 Emissions from Electricity Consumption and Generation, and TOOL07 by VT0011 Electricity System Emission Factors. CDM TOOL32 Positive Lists of Technologies was inactivated under the VCS Program on 1 October 2025 and is not eligible, so ACM0002's simplified additionality procedure is removed.

### How long can a VMR0017 project be credited for?

Energy and industry projects sit in the five-year row of Table 8 of the VCS Standard, v5.0: a five-year crediting period, renewable twice, to a maximum total of 15 years, for registration requests submitted on or after 1 January 2027. Projects and instances already registered under ACM0002 or AMS-I.D. keep their original maximum crediting period, but every new project activity instance has to correspond to a row of VMR0017's Table 1.

## Sources

1. [VMR0017 Grid-Connected Electricity Generation from Renewable Sources (ACM0002 Revision), v1.0 (23 April 2026)](https://verra.org/documents/vmr0017-grid-connected-electricity-generation-from-renewable-sources/), Verra (accessed 2026-09-30)
2. [VMR0017: methodology page](https://verra.org/methodologies/vmr0017-grid-connected-electricity-generation-from-renewable-sources-acm0002-revision-v1-0/), Verra (accessed 2026-09-30)
3. [VT0008 Additionality Assessment, v1.0 (14 October 2024)](https://verra.org/documents/vt0008-additionality-assessment-v1-0/), Verra (accessed 2026-09-30)
4. [VT0011 Electricity System Emission Factors, v1.0 (13 February 2025)](https://verra.org/documents/vt0011-electricity-system-emission-factors-v1-0/), Verra (accessed 2026-09-30)
5. [VCS Standard, v5.0 (16 December 2025)](https://verra.org/documents/vcs-standard-v5-0/), Verra (accessed 2026-09-30)
6. [VCS Methodology Requirements, v5.0 (16 December 2025)](https://verra.org/documents/vcs-methodology-requirements-v5-0/), Verra (accessed 2026-09-30)
7. [VCS Program Definitions, v5.0](https://verra.org/documents/vcs-program-definitions-v5-0/), Verra (accessed 2026-09-30)
8. [Registration and Issuance Process, v5.0](https://verra.org/documents/registration-and-issuance-process-v5-0/), Verra (accessed 2026-09-30)
9. [VCS Version 5: Overview of VCS Program Updates and Effective Dates](https://verra.org/documents/vcs-version-5-overview-of-vcs-program-updates-and-effective-dates/), Verra (accessed 2026-09-30)
10. [Validation and Verification Manual, v3.2 (19 October 2016)](https://verra.org/documents/validation-and-verification-manual-v3-2/), Verra (accessed 2026-09-30)
