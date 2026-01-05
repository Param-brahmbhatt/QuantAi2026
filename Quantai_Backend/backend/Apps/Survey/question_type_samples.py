"""
Question Type Sample Payloads and Answer Formats

This module contains detailed information for all 22 question types including:
- Descriptions
- Use cases
- Sample API payloads
- Answer formats
"""

QUESTION_TYPE_DETAILS = {
    'RDO': {
        'name': 'Single Selection (Radio)',
        'description': 'User selects exactly one option from a list',
        'use_cases': [
            'Demographic questions (gender, age group)',
            'Yes/No questions',
            'Single choice preferences',
            'Agreement scales (Strongly Disagree → Strongly Agree)'
        ],
        'widget': 'radio',
        'sample_payload': {
            'project': 1,
            'variable_name': 'gender',
            'title': 'What is your gender?',
            'description': 'Select one option',
            'question_type': 'RDO',
            'widget': 'radio',
            'is_required': True,
            'display_index': 1,
            'choice_groups': [
                {
                    'title': 'Gender Options',
                    'title_align': 'left',
                    'options': [
                        {'text': 'Male', 'value': 'male', 'order': 1},
                        {'text': 'Female', 'value': 'female', 'order': 2},
                        {'text': 'Non-binary', 'value': 'non_binary', 'order': 3},
                        {'text': 'Prefer not to say', 'value': 'prefer_not', 'order': 4}
                    ]
                }
            ]
        },
        'answer_format': {
            'question': 1,
            'profile': 5,
            'option': [2],
            'input': None
        }
    },
    'CHB': {
        'name': 'Multiple Selection (Checkbox)',
        'description': 'User can select multiple options from a list',
        'use_cases': [
            '"Select all that apply" questions',
            'Multi-interest selection',
            'Feature preferences',
            'Multi-symptom tracking'
        ],
        'widget': 'checkbox',
        'sample_payload': {
            'project': 1,
            'variable_name': 'interests',
            'title': 'What are your interests? (Select all that apply)',
            'question_type': 'CHB',
            'widget': 'checkbox',
            'is_required': False,
            'display_index': 2,
            'choice_groups': [
                {
                    'title': 'Interest Categories',
                    'options': [
                        {'text': 'Technology', 'value': 'tech', 'order': 1},
                        {'text': 'Sports', 'value': 'sports', 'order': 2},
                        {'text': 'Music', 'value': 'music', 'order': 3},
                        {'text': 'Travel', 'value': 'travel', 'order': 4}
                    ]
                }
            ]
        },
        'answer_format': {
            'question': 2,
            'profile': 5,
            'option': [1, 3, 4],
            'input': None
        }
    },
    'DRP': {
        'name': 'Dropdown Menu',
        'description': 'User selects one option from a dropdown list',
        'use_cases': [
            'Long lists of options (countries, states, cities)',
            'Category selection',
            'Single choice when many options available',
            'Compact UI required'
        ],
        'widget': 'dropdown',
        'sample_payload': {
            'project': 1,
            'variable_name': 'country',
            'title': 'Select your country of residence',
            'question_type': 'DRP',
            'widget': 'dropdown',
            'is_required': True,
            'display_index': 3,
            'choice_groups': [
                {
                    'title': 'Countries',
                    'options': [
                        {'text': 'United States', 'value': 'US', 'order': 1},
                        {'text': 'United Kingdom', 'value': 'UK', 'order': 2},
                        {'text': 'Canada', 'value': 'CA', 'order': 3},
                        {'text': 'India', 'value': 'IN', 'order': 4}
                    ]
                }
            ]
        },
        'answer_format': {
            'question': 3,
            'profile': 5,
            'option': [4],
            'input': None
        }
    },
    'TXT': {
        'name': 'Short Text Input',
        'description': 'Single-line text input for brief responses',
        'use_cases': [
            'Name, job title',
            'Short answers',
            'Keywords',
            'Single-word responses'
        ],
        'widget': 'text',
        'sample_payload': {
            'project': 1,
            'variable_name': 'job_title',
            'title': 'What is your current job title?',
            'description': 'Please provide your official job title',
            'question_type': 'TXT',
            'widget': 'text',
            'is_required': True,
            'display_index': 5
        },
        'answer_format': {
            'question': 5,
            'profile': 5,
            'option': [],
            'input': 'Senior Software Engineer'
        }
    },
    'TXTL': {
        'name': 'Long Text Input',
        'description': 'Multi-line text area for lengthy responses',
        'use_cases': [
            'Comments/feedback',
            'Detailed explanations',
            'Open-ended questions',
            'Descriptions'
        ],
        'widget': 'textarea',
        'sample_payload': {
            'project': 1,
            'variable_name': 'feedback',
            'title': 'Please share your detailed feedback about our product',
            'description': 'Be as specific as possible',
            'question_type': 'TXTL',
            'widget': 'textarea',
            'is_required': False,
            'display_index': 6
        },
        'answer_format': {
            'question': 6,
            'profile': 5,
            'option': [],
            'input': 'I have been using your product for 6 months and overall I am very satisfied...'
        }
    },
    'RAT': {
        'name': 'Rating Scale (Likert/Star)',
        'description': 'Likert scale or star rating',
        'use_cases': [
            'Satisfaction rating (1-5 stars)',
            'Agreement scale (Strongly Disagree → Strongly Agree)',
            'Quality rating',
            'Performance evaluation'
        ],
        'widget': 'rating-stars',
        'sample_payload': {
            'project': 1,
            'variable_name': 'product_satisfaction',
            'title': 'How satisfied are you with our product?',
            'question_type': 'RAT',
            'widget': 'rating-stars',
            'is_required': True,
            'display_index': 13,
            'choice_groups': [
                {
                    'title': 'Rate from 1 to 5 stars',
                    'options': [
                        {'text': '1 Star', 'value': '1', 'order': 1},
                        {'text': '2 Stars', 'value': '2', 'order': 2},
                        {'text': '3 Stars', 'value': '3', 'order': 3},
                        {'text': '4 Stars', 'value': '4', 'order': 4},
                        {'text': '5 Stars', 'value': '5', 'order': 5}
                    ]
                }
            ]
        },
        'answer_format': {
            'question': 13,
            'profile': 5,
            'option': [4],
            'input': None
        }
    },
    'NPS': {
        'name': 'Net Promoter Score',
        'description': 'Standard NPS question (0-10 scale)',
        'use_cases': [
            'Customer loyalty measurement',
            'Product recommendation likelihood',
            'Brand advocacy'
        ],
        'widget': 'nps-scale',
        'sample_payload': {
            'project': 1,
            'variable_name': 'nps_score',
            'title': 'How likely are you to recommend our product to a friend or colleague?',
            'question_type': 'NPS',
            'widget': 'nps-scale',
            'is_required': True,
            'display_index': 14,
            'choice_groups': [
                {
                    'title': 'Rate from 0 (Not at all likely) to 10 (Extremely likely)',
                    'options': [
                        {'text': '0', 'value': '0', 'order': 1},
                        {'text': '5', 'value': '5', 'order': 6},
                        {'text': '10', 'value': '10', 'order': 11}
                    ]
                }
            ]
        },
        'answer_format': {
            'question': 14,
            'profile': 5,
            'option': [9],
            'input': None
        }
    },
    'SLI': {
        'name': 'Slider Scale',
        'description': 'Interactive slider for numeric selection',
        'use_cases': [
            'Budget ranges',
            'Preference intensity',
            'Probability estimates',
            'Continuous scales'
        ],
        'widget': 'slider',
        'sample_payload': {
            'project': 1,
            'variable_name': 'budget_range',
            'title': 'What is your monthly budget for this category?',
            'question_type': 'SLI',
            'widget': 'slider',
            'is_required': True,
            'display_index': 15
        },
        'answer_format': {
            'question': 15,
            'profile': 5,
            'option': [],
            'input': 2500
        }
    },
    'RNK': {
        'name': 'Ranking',
        'description': 'User ranks options in order of preference',
        'use_cases': [
            'Priority ranking',
            'Feature importance',
            'Preference ordering',
            'Competitive analysis'
        ],
        'widget': 'ranking',
        'sample_payload': {
            'project': 1,
            'variable_name': 'feature_priority',
            'title': 'Rank these features by importance to you',
            'question_type': 'RNK',
            'widget': 'ranking',
            'is_required': True,
            'display_index': 16,
            'choice_groups': [
                {
                    'title': 'Drag to reorder',
                    'options': [
                        {'text': 'Performance', 'value': 'performance', 'order': 1},
                        {'text': 'Design', 'value': 'design', 'order': 2},
                        {'text': 'Price', 'value': 'price', 'order': 3},
                        {'text': 'Support', 'value': 'support', 'order': 4}
                    ]
                }
            ]
        },
        'answer_format': {
            'question': 16,
            'profile': 5,
            'option': [3, 1, 4, 2],
            'input': None
        }
    },
    'MTX': {
        'name': 'Matrix/Grid',
        'description': 'Multiple questions with same answer choices in grid format',
        'use_cases': [
            'Multiple attributes rating',
            'Comparison surveys',
            'Feature evaluation',
            'Multi-dimensional assessment'
        ],
        'widget': 'matrix-grid',
        'sample_payload': {
            'project': 1,
            'variable_name': 'service_rating',
            'title': 'Rate each aspect of our service',
            'question_type': 'MTX',
            'widget': 'matrix-grid',
            'is_required': True,
            'display_index': 17
        },
        'answer_format': {
            'question': 17,
            'profile': 5,
            'option': [],
            'input_row': {
                'row_1': 'col_4',
                'row_2': 'col_5',
                'row_3': 'col_3'
            }
        }
    },
    'FIL': {
        'name': 'File Upload',
        'description': 'Allow users to upload files',
        'use_cases': [
            'Document submission',
            'Resume upload',
            'Image upload',
            'Attachment collection'
        ],
        'widget': 'file-upload',
        'sample_payload': {
            'project': 1,
            'variable_name': 'resume_upload',
            'title': 'Upload your resume',
            'question_type': 'FIL',
            'widget': 'file-upload',
            'is_required': True,
            'display_index': 18,
            'file_upload_allowed_extention': 'pdf,doc,docx'
        },
        'answer_format': {
            'question': 18,
            'profile': 5,
            'option': [],
            'input': 'https://example.com/uploads/resume_john_doe.pdf'
        }
    },
    'DT': {
        'name': 'Date/Time Picker',
        'description': 'Date and/or time selection',
        'use_cases': [
            'Birth date',
            'Event scheduling',
            'Appointment booking',
            'Date range selection'
        ],
        'widget': 'datetime-picker',
        'sample_payload': {
            'project': 1,
            'variable_name': 'birth_date',
            'title': 'What is your date of birth?',
            'question_type': 'DT',
            'widget': 'date-picker',
            'is_required': True,
            'display_index': 19
        },
        'answer_format': {
            'question': 19,
            'profile': 5,
            'option': [],
            'input': '1990-05-15'
        }
    },
    'IMG': {
        'name': 'Image Choice',
        'description': 'User selects option(s) represented by images',
        'use_cases': [
            'Product selection',
            'Logo/brand recognition',
            'Visual preferences',
            'Design choices'
        ],
        'widget': 'image-radio',
        'sample_payload': {
            'project': 1,
            'variable_name': 'product_choice',
            'title': 'Which product design do you prefer?',
            'question_type': 'IMG',
            'widget': 'image-radio',
            'is_required': True,
            'display_index': 4,
            'choice_groups': [
                {
                    'title': 'Product Designs',
                    'options': [
                        {'text': 'Design A', 'value': 'design_a', 'order': 1},
                        {'text': 'Design B', 'value': 'design_b', 'order': 2}
                    ]
                }
            ]
        },
        'answer_format': {
            'question': 4,
            'profile': 5,
            'option': [1],
            'input': None
        }
    },
    'SIG': {
        'name': 'Signature Capture',
        'description': 'Digital signature capture',
        'use_cases': [
            'Agreement signing',
            'Consent forms',
            'Legal documents',
            'Authorization'
        ],
        'widget': 'signature-pad',
        'sample_payload': {
            'project': 1,
            'variable_name': 'consent_signature',
            'title': 'Please sign to confirm your consent',
            'question_type': 'SIG',
            'widget': 'signature-pad',
            'is_required': True,
            'display_index': 20
        },
        'answer_format': {
            'question': 20,
            'profile': 5,
            'option': [],
            'input': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
        }
    },
    'GEO': {
        'name': 'Geolocation',
        'description': 'Capture user location coordinates',
        'use_cases': [
            'Store locator',
            'Service area verification',
            'Location-based surveys',
            'Geographic targeting'
        ],
        'widget': 'geolocation',
        'sample_payload': {
            'project': 1,
            'variable_name': 'current_location',
            'title': 'Share your current location',
            'question_type': 'GEO',
            'widget': 'geolocation',
            'is_required': False,
            'display_index': 21
        },
        'answer_format': {
            'question': 21,
            'profile': 5,
            'option': [],
            'input': {
                'latitude': 37.7749,
                'longitude': -122.4194,
                'accuracy': 10
            }
        }
    },
    'AV': {
        'name': 'Audio/Video Response',
        'description': 'Record audio or video responses',
        'use_cases': [
            'Video testimonials',
            'Voice feedback',
            'Recorded interviews',
            'User testing sessions'
        ],
        'widget': 'media-recorder',
        'sample_payload': {
            'project': 1,
            'variable_name': 'video_testimonial',
            'title': 'Record a short video testimonial',
            'question_type': 'AV',
            'widget': 'video-recorder',
            'is_required': False,
            'display_index': 22
        },
        'answer_format': {
            'question': 22,
            'profile': 5,
            'option': [],
            'input': 'https://example.com/uploads/testimonial_video.mp4'
        }
    },
    'EML': {
        'name': 'Email Address',
        'description': 'Validated email input field',
        'use_cases': [
            'Contact email',
            'Secondary email',
            'Work email',
            'Newsletter subscription'
        ],
        'widget': 'email',
        'sample_payload': {
            'project': 1,
            'variable_name': 'work_email',
            'title': 'What is your work email address?',
            'question_type': 'EML',
            'widget': 'email',
            'is_required': True,
            'display_index': 7
        },
        'answer_format': {
            'question': 7,
            'profile': 5,
            'option': [],
            'input': 'john.doe@company.com'
        }
    },
    'PHN': {
        'name': 'Phone Number',
        'description': 'Validated phone number input',
        'use_cases': [
            'Contact phone',
            'Emergency contact',
            'Mobile number',
            'Verification'
        ],
        'widget': 'phone',
        'sample_payload': {
            'project': 1,
            'variable_name': 'mobile_phone',
            'title': 'What is your mobile phone number?',
            'description': 'Include country code (e.g., +1234567890)',
            'question_type': 'PHN',
            'widget': 'phone',
            'is_required': True,
            'display_index': 8
        },
        'answer_format': {
            'question': 8,
            'profile': 5,
            'option': [],
            'input': '+14155552671'
        }
    },
    'URL': {
        'name': 'Website URL',
        'description': 'Validated URL input field',
        'use_cases': [
            'Company website',
            'Portfolio link',
            'Social media profiles',
            'Reference links'
        ],
        'widget': 'url',
        'sample_payload': {
            'project': 1,
            'variable_name': 'company_website',
            'title': 'What is your company website?',
            'question_type': 'URL',
            'widget': 'url',
            'is_required': False,
            'display_index': 9
        },
        'answer_format': {
            'question': 9,
            'profile': 5,
            'option': [],
            'input': 'https://www.company.com'
        }
    },
    'NUM': {
        'name': 'Numeric Input',
        'description': 'Validated numeric input with optional range constraints',
        'use_cases': [
            'Age',
            'Quantity',
            'Years of experience',
            'Budget/salary ranges'
        ],
        'widget': 'number',
        'sample_payload': {
            'project': 1,
            'variable_name': 'age',
            'title': 'What is your age?',
            'question_type': 'NUM',
            'widget': 'number',
            'is_required': True,
            'display_index': 12
        },
        'answer_format': {
            'question': 12,
            'profile': 5,
            'option': [],
            'input': 32
        }
    },
    'ADR': {
        'name': 'Address',
        'description': 'Structured address input with validation',
        'use_cases': [
            'Shipping address',
            'Billing address',
            'Office location',
            'Residence address'
        ],
        'widget': 'address-form',
        'sample_payload': {
            'project': 1,
            'variable_name': 'shipping_address',
            'title': 'What is your shipping address?',
            'question_type': 'ADR',
            'widget': 'address-form',
            'is_required': True,
            'display_index': 10
        },
        'answer_format': {
            'question': 10,
            'profile': 5,
            'option': [],
            'input': {
                'street': '123 Main Street',
                'apartment': 'Apt 4B',
                'city': 'New York',
                'state': 'NY',
                'zip': '10001',
                'country': 'USA'
            }
        }
    },
    'CTI': {
        'name': 'Contact Information',
        'description': 'Structured contact info with sub-field validation',
        'use_cases': [
            'Emergency contact',
            'Reference contact',
            'Next of kin',
            'Business contact'
        ],
        'widget': 'contact-form',
        'sample_payload': {
            'project': 1,
            'variable_name': 'emergency_contact',
            'title': 'Emergency Contact Information',
            'description': 'Provide contact details for emergency situations',
            'question_type': 'CTI',
            'widget': 'contact-form',
            'is_required': True,
            'display_index': 11
        },
        'answer_format': {
            'question': 11,
            'profile': 5,
            'option': [],
            'input': {
                'name': 'Jane Doe',
                'email': 'jane.doe@example.com',
                'phone': '+14155552672',
                'relationship': 'Spouse'
            }
        }
    }
}
